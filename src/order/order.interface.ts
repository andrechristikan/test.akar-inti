import { OrderEntity } from './order.schema';
import { Document } from 'mongoose';
import { ProductDocument } from 'src/product/product.interface';
import { UserDocument } from 'src/user/user.interface';

export interface OrderDocumentFull
    extends Omit<OrderDocument, 'user' | 'products'> {
    products: Array<{
        quantity: number;
        product: ProductDocument;
    }>;
    user: UserDocument;
}

export type OrderDocument = OrderEntity & Document;
