import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentEntity } from './payment.schema';
import { PaymentDocument } from './payment.interface';
import { OrderEntity } from 'src/order/order.schema';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(PaymentEntity.name)
        private readonly paymentModel: Model<PaymentDocument>
    ) {}

    async findOne<T>(
        find: Record<string, any>,
        populate?: boolean
    ): Promise<T> {
        const payment = this.paymentModel.findOne(find);

        if (populate) {
            payment.populate({
                path: 'order',
                model: OrderEntity.name
            });
        }

        return payment.lean();
    }

    async findOneById(paymentId: string): Promise<PaymentDocument> {
        return this.paymentModel.findById(paymentId).lean();
    }

    async create(data: Record<string, any>): Promise<PaymentDocument> {
        const create: PaymentDocument = new this.paymentModel({
            order: data.order,
            accountName: data.accountName,
            accountNumber: data.accountNumber,
            bank: data.bank,
            paymentDate: data.paymentDate
        });

        return create.save();
    }

    async deleteOneById(paymentId: string): Promise<PaymentDocument> {
        return this.paymentModel.deleteOne({
            _id: paymentId
        });
    }

    async deleteMany(find?: Record<string, any>): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.paymentModel
                .deleteMany(find)
                .then(() => {
                    resolve(true);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }
}
