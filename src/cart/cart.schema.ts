import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductEntity } from 'src/product/product.schema';

@Schema()
export class CartEntity {
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
    Products: Types.ObjectId[];
}

export const CartDatabaseName = 'carts';
export const CartSchema = SchemaFactory.createForClass(CartEntity);
