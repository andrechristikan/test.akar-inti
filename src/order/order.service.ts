import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderEntity } from './order.schema';
import { OrderDocument } from './order.interface';
import { ProductEntity } from 'src/product/product.schema';
import { UserEntity } from 'src/user/user.schema';
import { CartService } from 'src/cart/cart.service';
import { CartDocumentFull } from 'src/cart/cart.interface';
import { OrderStatus } from './order.constant';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(OrderEntity.name)
        private readonly orderModel: Model<OrderDocument>,
        private readonly cartService: CartService
    ) {}

    async findAll(
        offset: number,
        limit: number,
        find?: Record<string, any>
    ): Promise<OrderDocument[]> {
        return this.orderModel.find(find).skip(offset).limit(limit).lean();
    }

    async totalData(find?: Record<string, any>): Promise<number> {
        return this.orderModel.countDocuments(find);
    }

    async findOneById<T>(cartId: string, populate?: boolean): Promise<T> {
        const cart = this.orderModel.findById(cartId);

        if (populate) {
            cart.populate({
                path: 'products.product',
                model: ProductEntity.name,
                match: { isActive: true }
            }).populate({
                path: 'user',
                model: UserEntity.name
            });
        }

        return cart.lean();
    }

    async findOne<T>(
        find?: Record<string, any>,
        populate?: boolean
    ): Promise<T> {
        const cart = this.orderModel.findOne(find);

        if (populate) {
            cart.populate({
                path: 'products.product',
                model: ProductEntity.name,
                match: { isActive: true }
            }).populate({
                path: 'user',
                model: UserEntity.name
            });
        }

        return cart.lean();
    }

    async create(
        place: Record<string, any>,
        user: Types.ObjectId
    ): Promise<OrderDocument> {
        const data: CartDocumentFull = await this.cartService.findOne<CartDocumentFull>(
            { user },
            true
        );

        const products = data.products.map((val) => ({
            quantity: val.quantity,
            product: Types.ObjectId(val.product._id),
            price: val.product.price,
            name: val.product.name,
            description: val.product.description
        }));

        place = {
            address: place.address,
            receiver: place.receiver,
            receiverPhone: place.receiverPhone
        };

        const create: OrderDocument = new this.orderModel({
            user,
            products: products,
            place,
            status: OrderStatus.Payment
        });

        return create.save();
    }

    async deleteMany(find?: Record<string, any>): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.orderModel
                .deleteMany(find)
                .then(() => {
                    resolve(true);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    async deleteOneById(orderId: string): Promise<OrderDocument> {
        return this.orderModel.deleteOne({
            _id: orderId
        });
    }

    async updateOne(
        find: Record<string, any>,
        data: Record<string, any>
    ): Promise<OrderDocument> {
        return this.orderModel.updateOne(find, data);
    }
}
