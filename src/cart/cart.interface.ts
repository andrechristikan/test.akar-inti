import { CartEntity } from './cart.schema';
import { Document } from 'mongoose';
import { ProductEntity } from 'src/product/product.schema';

export interface CartDocumentFull extends Omit<CartDocument, 'products'> {
    products: ProductEntity[];
}

export type CartDocument = CartEntity & Document;
