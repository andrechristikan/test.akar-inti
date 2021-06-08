import { CartEntity } from './cart.schema';
import { Document } from 'mongoose';
import { ProductDocument } from 'src/product/product.interface';
import { UserDocument } from 'src/user/user.interface';

export interface CartDocumentFull
    extends Omit<CartDocument, 'user' | 'products'> {
    products: Array<{
        quantity: number;
        product: ProductDocument;
    }>;
    user: UserDocument;
}

export type CartDocument = CartEntity & Document;
