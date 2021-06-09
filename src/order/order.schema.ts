import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ListOfBank } from 'src/payment/payment.constant';
import { ProductEntity } from 'src/product/product.schema';
import { UserEntity } from 'src/user/user.schema';
import { OrderStatus } from './order.constant';

@Schema()
export class OrderEntity {
    @Prop({
        required: true,
        index: true,
        ref: UserEntity.name,
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
        type: Object
    })
    payment?: {
        date: Date;
    };

    @Prop({
        required: false,
        type: Object
    })
    shipment?: {
        date: Date;
        number: string;
    };

    @Prop({
        required: false,
        type: Date
    })
    completedDate?: Date;
}

export const OrderDatabaseName = 'orders';
export const OrderSchema = SchemaFactory.createForClass(OrderEntity);
