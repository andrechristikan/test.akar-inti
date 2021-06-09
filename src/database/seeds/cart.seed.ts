import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { UserService } from 'src/user/user.service';
import { CartService } from 'src/cart/cart.service';
import { UserDocument } from 'src/user/user.interface';
import { Types } from 'mongoose';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class CartSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        private readonly userService: UserService,
        private readonly cartService: CartService,
        private readonly productService: ProductService
    ) {}

    @Command({
        command: 'create:cart',
        describe: 'insert carts',
        autoExit: true
    })
    async create(): Promise<void> {
        const user = await this.userService.findOne<UserDocument>({
            email: 'andreck@mail.com'
        });

        try {
            const cart = await this.cartService.create(
                Types.ObjectId(user._id)
            );

            const products = await this.productService.findAll(0, 3);
            const productsMap = products.map((val) => ({
                product: val._id,
                quantity: Math.floor(Math.random() * 5) + 1
            }));

            await this.cartService.updateProducts(
                Types.ObjectId(cart._id),
                productsMap
            );

            this.logger.info('Insert Cart Succeed', {
                class: 'CartSeed',
                function: 'create'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'CartSeed',
                function: 'create'
            });
        }
    }

    @Command({
        command: 'remove:cart',
        describe: 'remove carts',
        autoExit: true
    })
    async remove(): Promise<void> {
        try {
            await this.cartService.deleteMany();

            this.logger.info('Remove Cart Succeed', {
                class: 'CartSeed',
                function: 'remove'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'CartSeed',
                function: 'remove'
            });
        }
    }
}
