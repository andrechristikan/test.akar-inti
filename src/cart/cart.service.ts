import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CartEntity } from './cart.schema';
import { CartDocument } from './cart.interface';
import { ProductEntity } from 'src/product/product.schema';
import { UserEntity } from 'src/user/user.schema';

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

    async findOneById<T>(cartId: string, populate?: boolean): Promise<T> {
        const cart = this.cartModel.findById(cartId);

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
        const cart = this.cartModel.findOne(find);

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

    async create(user: string): Promise<CartDocument> {
        const create: CartDocument = new this.cartModel({
            user: Types.ObjectId(user),
            products: []
        });

        return create.save();
    }

    async updateProducts(
        cartId: string,
        products: Record<string, any>[]
    ): Promise<CartDocument> {
        return this.cartModel.updateOne(
            {
                _id: Types.ObjectId(cartId)
            },
            {
                products: products as Types.ObjectId[]
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
