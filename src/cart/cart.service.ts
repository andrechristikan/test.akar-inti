import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CartEntity } from './cart.schema';
import { CartDocument } from './cart.interface';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(CartEntity.name)
        private readonly cartModel: Model<CartDocument>
    ) {}

    async findAll(
        offset: number,
        limit: number,
        find?: Record<string, any>
    ): Promise<CartDocument[]> {
        return this.cartModel.find(find).skip(offset).limit(limit).lean();
    }

    async totalData(find?: Record<string, any>): Promise<number> {
        return this.cartModel.countDocuments(find);
    }

    async findOneById(cartId: string): Promise<CartDocument> {
        return this.cartModel.findById(cartId).lean();
    }

    async create(userId: string): Promise<CartDocument> {
        const create: CartDocument = new this.cartModel({
            user: Types.ObjectId(userId),
            products: []
        });

        return create.save();
    }

    async addItem(
        cartId: string,
        products: Record<string, any>[],
        newItem: Record<string, any>
    ): Promise<CartDocument> {
        return this.cartModel.updateOne(
            {
                _id: cartId
            },
            {
                products: products.push(newItem)
            }
        );
    }

    async removeItem(
        cartId: string,
        products: Record<string, any>[],
        newItem: Record<string, any>
    ): Promise<CartDocument> {
        const index = products.indexOf((val) => val === newItem);
        return this.cartModel.updateOne(
            {
                _id: cartId
            },
            {
                products: products.slice(index, 1)
            }
        );
    }

    async deleteMany(find?: Record<string, any>): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.cartModel
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
