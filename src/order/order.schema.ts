import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ListOfBank, PaymentMethod } from 'src/payment/payment.constant';
import { ProductEntity } from 'src/product/product.schema';
import { OrderStatus } from './order.constant';

@Schema()
export class OrderEntity {
    @Prop({
        required: true,
        index: true,
        type: Types.ObjectId
    })
    user: Types.ObjectId;

    @Prop({
        required: true,
        type: Array,
        default: [],
        ref: ProductEntity.name
    })
    products: Record<string, any>[];

    @Prop({
        required: true,
        enum: OrderStatus,
        default: OrderStatus.Payment
    })
    status: string;

    @Prop({
        required: true,
        type: Object
    })
    place: Record<string, any>;

    @Prop({
        required: false,
        enum: ListOfBank
    })
    bank?: string;

    @Prop({
        required: false,
        enum: PaymentMethod
    })
    paymentMethod?: string;
}

export const OrderDatabaseName = 'orders';
export const OrderSchema = SchemaFactory.createForClass(OrderEntity);
