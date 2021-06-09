import {
    Body,
    Controller,
    Get,
    Post,
    DefaultValuePipe,
    ParseIntPipe,
    Query,
    Param,
    BadRequestException,
    InternalServerErrorException,
    Patch
} from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { Response, ResponseStatusCode } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { AuthJwtGuard, User } from 'src/auth/auth.decorator';
import { PermissionList } from 'src/permission/permission.constant';
import { Permissions } from 'src/permission/permission.decorator';
import { OrderService } from './order.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { Pagination } from 'src/pagination/pagination.decorator';
import { OrderDocument, OrderDocumentFull } from './order.interface';
import { PAGE, PER_PAGE } from 'src/pagination/pagination.constant';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { Types } from 'mongoose';
import { OrderStatus } from './order.constant';
import { CartDocument } from 'src/cart/cart.interface';
import { CartService } from 'src/cart/cart.service';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentDocument } from 'src/payment/payment.interface';
import { ProductService } from 'src/product/product.service';

@Controller('/order')
export class OrderController {
    constructor(
        @Response() private readonly responseService: ResponseService,
        @Message() private readonly messageService: MessageService,
        @Pagination() private readonly paginationService: PaginationService,
        @Logger() private readonly logger: LoggerService,
        private readonly orderService: OrderService,
        private readonly paymentService: PaymentService,
        private readonly cartService: CartService,
        private readonly productService: ProductService
    ) {}

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead)
    @ResponseStatusCode()
    @Get('/')
    async findAll(
        @Query('page', new DefaultValuePipe(PAGE), ParseIntPipe) page: number,
        @Query('perPage', new DefaultValuePipe(PER_PAGE), ParseIntPipe)
        perPage: number
    ): Promise<IResponse> {
        const skip = await this.paginationService.skip(page, perPage);
        const find: Record<string, any> = {
            status: { $in: ['Paid', 'Shipment', 'Cancel', 'Completed'] }
        };

        const orders: OrderDocument[] = await this.orderService.findAll(
            skip,
            perPage,
            find
        );

        const totalData: number = await this.orderService.totalData(find);
        const totalPage = await this.paginationService.totalPage(
            totalData,
            perPage
        );

        return this.responseService.paging(
            this.messageService.get('order.findAll.success'),
            totalData,
            totalPage,
            page,
            perPage,
            orders
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderList)
    @ResponseStatusCode()
    @Get('/list')
    async list(
        @Query('page', new DefaultValuePipe(PAGE), ParseIntPipe) page: number,
        @Query('perPage', new DefaultValuePipe(PER_PAGE), ParseIntPipe)
        perPage: number,
        @Query('status', new DefaultValuePipe(OrderStatus.Payment))
        status: string,
        @User('_id') userId: string
    ): Promise<IResponse> {
        const skip = await this.paginationService.skip(page, perPage);
        const find = {
            user: Types.ObjectId(userId),
            status: { $in: status.split(',').map((val) => OrderStatus[val]) }
        };
        const orders: OrderDocument[] = await this.orderService.findAll(
            skip,
            perPage,
            find
        );
        const totalData: number = await this.orderService.totalData(find);
        const totalPage = await this.paginationService.totalPage(
            totalData,
            perPage
        );

        return this.responseService.paging(
            this.messageService.get('order.list.success'),
            totalData,
            totalPage,
            page,
            perPage,
            orders
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderList)
    @ResponseStatusCode()
    @Get('/shipment/:shipmentNumber')
    async shipment(
        @Param('shipmentNumber') shipmentNumber: string
    ): Promise<IResponse> {
        const order: OrderDocument[] = await this.orderService.findOne({
            'shipment.number': shipmentNumber
        });

        if (!order) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'shipment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.shipment.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('order.shipment.success'),
            order
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderList)
    @ResponseStatusCode()
    @Get('/list-detail/:orderId')
    async listDetail(
        @Param('orderId') orderId: string,
        @User('_id') userId: string
    ): Promise<IResponse> {
        const order: OrderDocumentFull = await this.orderService.findOne<OrderDocumentFull>(
            {
                _id: Types.ObjectId(orderId),
                user: Types.ObjectId(userId)
            },
            true
        );
        if (!order) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'listDetail'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.listDetail.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('order.listDetail.success'),
            order
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead)
    @ResponseStatusCode()
    @Get('/:orderId')
    async findOneById(@Param('orderId') orderId: string): Promise<IResponse> {
        const order: OrderDocumentFull = await this.orderService.findOne<OrderDocumentFull>(
            {
                _id: Types.ObjectId(orderId),
                status: { $in: ['Paid', 'Shipment', 'Cancel', 'Completed'] }
            },
            true
        );
        if (!order) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'listDetail'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.listDetail.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('order.listDetail.success'),
            order
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderList, PermissionList.OrderCreate)
    @ResponseStatusCode()
    @Post('/create')
    async create(
        @Body()
        data: Record<string, any>,
        @User('_id') userId: string
    ): Promise<IResponse> {
        const cart: CartDocument = await this.cartService.findOne<CartDocument>(
            {
                user: Types.ObjectId(userId)
            }
        );
        if (!cart) {
            this.logger.error('create Error', {
                class: 'OrderController',
                function: 'create'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updatePayment.cartNotFound')
                )
            );
        } else if (cart && cart.products.length === 0) {
            this.logger.error('create Error', {
                class: 'OrderController',
                function: 'create'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updatePayment.productNull')
                )
            );
        }

        const products = cart.products.map((val) =>
            Types.ObjectId(val.product)
        );
        const productsCheck = await this.productService.findAll(
            0,
            products.length + 1,
            {
                _id: {
                    $in: products
                }
            }
        );

        const productsStock = cart.products.map((val) => {
            const stock = productsCheck.filter(
                (vls) => `${val.product}` === `${vls._id}`
            )[0].quantity;
            const quantity = val.quantity;

            return {
                ...val,
                stock,
                next: quantity <= stock ? true : false
            };
        });
        const productOut = productsStock.filter((val) => val.next === false);
        const productIn: Record<string, any>[] = productsStock.filter(
            (val) => val.next === true
        );

        if (productOut.length > 0) {
            this.logger.error('create try catch', {
                class: 'OrderController',
                function: 'create'
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get('order.create.outOfStock')
                )
            );
        }

        for (const ins of productIn) {
            await this.productService.updateOneById(
                Types.ObjectId(ins.product),
                {
                    quantity: ins.stock - ins.quantity
                }
            );
        }

        try {
            const order: OrderDocument = await this.orderService.create(
                data.place,
                Types.ObjectId(userId)
            );
            await this.cartService.updateProducts(Types.ObjectId(cart._id), []);

            return this.responseService.success(
                this.messageService.get('order.create.success'),
                order
            );
        } catch (err: any) {
            this.logger.error('create try catch', {
                class: 'OrderController',
                function: 'create',
                error: err
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead, PermissionList.OrderUpdate)
    @ResponseStatusCode()
    @Patch('/update-payment/:orderId')
    async updatePayment(@Param('orderId') orderId: string): Promise<IResponse> {
        const check: OrderDocument = await this.orderService.findOne<OrderDocument>(
            {
                _id: Types.ObjectId(orderId)
            }
        );
        if (!check) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updatePayment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updatePayment.notFound')
                )
            );
        } else if (check.status !== OrderStatus.Payment) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateShipment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get(
                        'order.updateShipment.statusNotMatch'
                    )
                )
            );
        }

        const payment = await this.paymentService.findOne<PaymentDocument>({
            order: Types.ObjectId(check._id)
        });
        if (!payment) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updatePayment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get(
                        'order.updatePayment.paymentNotFound'
                    )
                )
            );
        }

        try {
            await this.orderService.updateOne(
                {
                    _id: Types.ObjectId(check._id)
                },
                {
                    status: OrderStatus.Paid,
                    paymentDate: new Date()
                }
            );

            return this.responseService.success(
                this.messageService.get('order.updatePayment.success')
            );
        } catch (err: any) {
            this.logger.error('updatePayment try catch', {
                class: 'OrderController',
                function: 'updatePayment',
                error: err
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead, PermissionList.OrderUpdate)
    @ResponseStatusCode()
    @Patch('/update-shipment/:orderId')
    async updateShipment(
        @Param('orderId') orderId: string,
        @Body()
        data: Record<string, any>
    ): Promise<IResponse> {
        const check: OrderDocument = await this.orderService.findOne<OrderDocument>(
            {
                _id: Types.ObjectId(orderId)
            }
        );
        if (!check) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateShipment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updateShipment.notFound')
                )
            );
        } else if (check.status !== OrderStatus.Paid) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateShipment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get(
                        'order.updateShipment.statusNotMatch'
                    )
                )
            );
        }

        try {
            await this.orderService.updateOne(
                {
                    _id: Types.ObjectId(check._id)
                },
                {
                    status: OrderStatus.Shipment,
                    shipment: {
                        date: new Date(),
                        number: data.number
                    }
                }
            );

            return this.responseService.success(
                this.messageService.get('order.updateShipment.success')
            );
        } catch (err: any) {
            this.logger.error('updateShipment try catch', {
                class: 'OrderController',
                function: 'updateShipment',
                error: err
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead, PermissionList.OrderUpdate)
    @ResponseStatusCode()
    @Patch('/update-completed/:orderId')
    async updateCompleted(
        @Param('orderId') orderId: string
    ): Promise<IResponse> {
        const check: OrderDocument = await this.orderService.findOne<OrderDocument>(
            {
                _id: Types.ObjectId(orderId)
            }
        );
        if (!check) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateShipment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updateShipment.notFound')
                )
            );
        } else if (check.status !== OrderStatus.Shipment) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateShipment'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get(
                        'order.updateShipment.statusNotMatch'
                    )
                )
            );
        }

        try {
            await this.orderService.updateOne(
                {
                    _id: Types.ObjectId(check._id)
                },
                {
                    status: OrderStatus.Completed,
                    completedDate: new Date()
                }
            );

            return this.responseService.success(
                this.messageService.get('order.updateShipment.success')
            );
        } catch (err: any) {
            this.logger.error('updateShipment try catch', {
                class: 'OrderController',
                function: 'updateShipment',
                error: err
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead, PermissionList.OrderUpdate)
    @ResponseStatusCode()
    @Patch('/update-cancel/:orderId')
    async updateCancel(@Param('orderId') orderId: string): Promise<IResponse> {
        const order: OrderDocument = await this.orderService.findOne<OrderDocument>(
            {
                _id: Types.ObjectId(orderId)
            }
        );
        if (!order) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateCancel'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updateCancel.notFound')
                )
            );
        } else if (order.status === OrderStatus.Completed) {
            this.logger.error('order Error', {
                class: 'OrderController',
                function: 'updateCancel'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('order.updateCancel.statusNotMatch')
                )
            );
        }

        const products = order.products.map((val) =>
            Types.ObjectId(val.product)
        );
        const productsCheck = await this.productService.findAll(
            0,
            products.length + 1,
            {
                _id: {
                    $in: products
                }
            }
        );

        for (const ins of order.products) {
            const stock = productsCheck.filter(
                (vls) => `${ins.product}` === `${vls._id}`
            )[0].quantity;
            const quantity = ins.quantity + stock;

            await this.productService.updateOneById(
                Types.ObjectId(ins.product),
                {
                    quantity
                }
            );
        }

        try {
            await this.orderService.updateOne(
                {
                    _id: Types.ObjectId(order._id)
                },
                {
                    status: OrderStatus.Cancel,
                    cancelDate: new Date()
                }
            );

            return this.responseService.success(
                this.messageService.get('order.updateCancel.success')
            );
        } catch (err: any) {
            this.logger.error('updateCancel try catch', {
                class: 'OrderController',
                function: 'updateCancel',
                error: err
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }
}
