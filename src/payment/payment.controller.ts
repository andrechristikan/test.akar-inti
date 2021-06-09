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
    InternalServerErrorException
} from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { Response, ResponseStatusCode } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { AuthJwtGuard } from 'src/auth/auth.decorator';
import { PermissionList } from 'src/permission/permission.constant';
import { Permissions } from 'src/permission/permission.decorator';
import { PaginationService } from 'src/pagination/pagination.service';
import { Pagination } from 'src/pagination/pagination.decorator';
import { PAGE, PER_PAGE } from 'src/pagination/pagination.constant';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { PaymentService } from './payment.service';
import { Types } from 'mongoose';
import { ListOfBank } from './payment.constant';
import { PaymentDocument, PaymentDocumentFull } from './payment.interface';
import { OrderStatus } from 'src/order/order.constant';

@Controller('/payment')
export class PaymentController {
    constructor(
        @Response() private readonly responseService: ResponseService,
        @Message() private readonly messageService: MessageService,
        @Pagination() private readonly paginationService: PaginationService,
        @Logger() private readonly logger: LoggerService,
        private readonly paymentService: PaymentService
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
    @Permissions(PermissionList.PaymentRead)
    @ResponseStatusCode()
    @Post('/create/:orderId')
    async create(
        @Param('orderId') orderId: string,
        @Body() data: Record<string, any>
    ): Promise<IResponse> {
        const check = await this.paymentService.findOne<PaymentDocumentFull>(
            {
                order: Types.ObjectId(orderId)
            },
            true
        );
        if (check) {
            this.logger.error('payment Error', {
                class: 'PaymentController',
                function: 'create'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('payment.create.hasPayment')
                )
            );
        } else if (check.order.status !== OrderStatus[OrderStatus.Payment]) {
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
}
