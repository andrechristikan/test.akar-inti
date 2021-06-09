import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    BadRequestException,
    Delete
} from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { Response, ResponseStatusCode } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { AuthJwtGuard, User } from 'src/auth/auth.decorator';
import { PermissionList } from 'src/permission/permission.constant';
import { Permissions } from 'src/permission/permission.decorator';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { PaymentService } from './payment.service';
import { Types } from 'mongoose';
import { ListOfBank } from './payment.constant';
import { PaymentDocument } from './payment.interface';
import { OrderStatus } from 'src/order/order.constant';
import { OrderService } from 'src/order/order.service';
import { OrderDocument } from 'src/order/order.interface';

@Controller('/payment')
export class PaymentController {
    constructor(
        @Response() private readonly responseService: ResponseService,
        @Message() private readonly messageService: MessageService,
        @Logger() private readonly logger: LoggerService,
        private readonly paymentService: PaymentService,
        private readonly orderService: OrderService
    ) {}

    @AuthJwtGuard()
    @Permissions(PermissionList.PaymentRead)
    @ResponseStatusCode()
    @Get('/:orderId')
    async findOne(@Param('orderId') orderId: string): Promise<IResponse> {
        const payment = await this.paymentService.findOne<PaymentDocument>({
            order: Types.ObjectId(orderId)
        });

        if (!payment) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'findOne'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('payment.findOne.success'),
            payment
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.PaymentList)
    @ResponseStatusCode()
    @Get('/list/:orderId')
    async list(
        @Param('orderId') orderId: string,
        @User('_id') userId: string
    ): Promise<IResponse> {
        const order = await this.orderService.findOne({
            user: Types.ObjectId(userId),
            _id: Types.ObjectId(orderId)
        });

        if (!order) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'list'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('payment.list.orderNotFound')
                )
            );
        }

        const payment = await this.paymentService.findOne<PaymentDocument>({
            order: Types.ObjectId(orderId)
        });

        if (!payment) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'list'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('payment.findOne.success'),
            payment
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.PaymentList, PermissionList.PaymentCreate)
    @ResponseStatusCode()
    @Post('/create/:orderId')
    async create(
        @Param('orderId') orderId: string,
        @Body() data: Record<string, any>
    ): Promise<IResponse> {
        const check = await this.paymentService.findOne<PaymentDocument>({
            order: Types.ObjectId(orderId)
        });

        const order = await this.orderService.findOneById<OrderDocument>(
            orderId
        );
        if (!order) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'create'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('payment.create.orderNotFound')
                )
            );
        } else if (check) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'create'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('payment.create.hasPayment')
                )
            );
        } else if (order.status !== OrderStatus[OrderStatus.Payment]) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'create'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('payment.create.notInPayment')
                )
            );
        }

        const payment = await this.paymentService.create({
            order: Types.ObjectId(orderId),
            accountName: data.accountName,
            accountNumber: data.accountNumber,
            bank: ListOfBank[data.bank],
            paymentDate: data.paymentDate
        });

        return this.responseService.success(
            this.messageService.get('payment.create.success'),
            payment
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.PaymentRead, PermissionList.PaymentDelete)
    @ResponseStatusCode()
    @Delete('/delete/:orderId')
    async delete(@Param('orderId') orderId: string): Promise<IResponse> {
        const payment: PaymentDocument = await this.paymentService.findOneById(
            orderId
        );
        if (!payment) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'delete'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        await this.paymentService.deleteOneById(payment._id);
        return this.responseService.success(
            this.messageService.get('payment.delete.success')
        );
    }
}
