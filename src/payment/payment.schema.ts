import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OrderEntity } from 'src/order/order.schema';
import { ListOfBank } from './payment.constant';

@Schema()
export class PaymentEntity {
    @Prop({
        required: true,
        index: true,
        ref: OrderEntity.name,
        type: Types.ObjectId
    })
    order: Types.ObjectId;

    @Prop({
        required: true,
        type: String
    })
    accountName: string;

    @Prop({
        required: true,
        type: String
    })
    accountNumber: string;

    @Prop({
        required: true,
        enum: ListOfBank
    })
    bank: string;

    @Prop({
        required: true,
        type: Date
    })
    paymentDate: Date;
}

export const PaymentDatabaseName = 'payments';
export const PaymentSchema = SchemaFactory.createForClass(PaymentEntity);
