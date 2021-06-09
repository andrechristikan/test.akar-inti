import { PaymentEntity } from './payment.schema';
import { Document } from 'mongoose';
import { OrderDocument } from 'src/order/order.interface';

export interface PaymentDocumentFull extends Omit<PaymentDocument, 'order'> {
    order: OrderDocument;
}

export type PaymentDocument = PaymentEntity & Document;
