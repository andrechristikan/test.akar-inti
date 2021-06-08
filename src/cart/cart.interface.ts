import { CartEntity } from './cart.schema';
import { Document } from 'mongoose';

export type CartDocument = CartEntity & Document;
