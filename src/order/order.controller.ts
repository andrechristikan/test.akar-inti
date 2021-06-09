import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    DefaultValuePipe,
    ParseIntPipe,
    Query,
    Delete,
    Param,
    BadRequestException,
    ParseBoolPipe,
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

@Controller('/order')
export class OrderController {
    constructor(
        @Response() private readonly responseService: ResponseService,
        @Message() private readonly messageService: MessageService,
        @Pagination() private readonly paginationService: PaginationService,
        @Logger() private readonly logger: LoggerService,
        private readonly orderService: OrderService
    ) {}

    @AuthJwtGuard()
    @Permissions(PermissionList.OrderRead)
    @ResponseStatusCode()
    @Get('/')
    async findAll(
        @Query('page', new DefaultValuePipe(PAGE), ParseIntPipe) page: number,
        @Query('perPage', new DefaultValuePipe(PER_PAGE), ParseIntPipe)
        perPage: number,
        @Query('status', new DefaultValuePipe(OrderStatus[OrderStatus.Payment]))
        status: string
    ): Promise<IResponse> {
        const skip = await this.paginationService.skip(page, perPage);
        const find: Record<string, any> = {};
        if (status) {
            find.status = { $in: status.split(',') };
        }

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
        @Query('status', new DefaultValuePipe(OrderStatus[OrderStatus.Payment]))
        status: string,
        @User('_id') userId: string
    ): Promise<IResponse> {
        const skip = await this.paginationService.skip(page, perPage);
        const find = {
            user: Types.ObjectId(userId),
            status: { $in: status.split(',') }
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
        try {
            const order: OrderDocument = await this.orderService.create(
                data.place,
                data.bank,
                Types.ObjectId(userId)
            );

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
    @Patch('/update-status/:orderId')
    async updateStatus(
        @Param('orderId') orderId: string,
        @Body()
        data: Record<string, any>
    ): Promise<IResponse> {
        const order: OrderDocument = await this.orderService.findOne<OrderDocument>(
            {
                _id: Types.ObjectId(orderId)
            }
        );

        const update: Record<string, any> = {
            status: OrderStatus[data.status]
        };

        if (OrderStatus[data.status] === OrderStatus[OrderStatus.Paid]) {
            update.paymentDate = new Date();
        } else if (
            OrderStatus[data.status] === OrderStatus[OrderStatus.Shipment]
        ) {
            update.shipmentDate = new Date();
        } else if (
            OrderStatus[data.status] === OrderStatus[OrderStatus.Completed]
        ) {
            update.completedDate = new Date();
        }

        try {
            await this.orderService.updateOne(
                {
                    _id: Types.ObjectId(order._id)
                },
                update
            );

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
}
