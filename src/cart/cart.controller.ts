import {
    Controller,
    Get,
    BadRequestException,
    Body,
    Patch
} from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { Response, ResponseStatusCode } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { AuthJwtGuard, User } from 'src/auth/auth.decorator';
import { PermissionList } from 'src/permission/permission.constant';
import { Permissions } from 'src/permission/permission.decorator';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { CartService } from './cart.service';
import { CartDocument, CartDocumentFull } from './cart.interface';
import { Types } from 'mongoose';
import { ProductService } from 'src/product/product.service';

@Controller('/cart')
export class CartController {
    constructor(
        @Response() private readonly responseService: ResponseService,
        @Message() private readonly messageService: MessageService,
        @Logger() private readonly logger: LoggerService,
        private readonly cartService: CartService,
        private readonly productService: ProductService
    ) {}

    @AuthJwtGuard()
    @Permissions(PermissionList.CartRead)
    @ResponseStatusCode()
    @Get('/')
    async findOne(@User('_id') userId: string): Promise<IResponse> {
        const cart: CartDocumentFull = await this.cartService.findOne<CartDocumentFull>(
            {
                user: Types.ObjectId(userId)
            },
            true
        );
        if (!cart) {
            this.logger.error('user Error', {
                class: 'CartController',
                function: 'findOneById'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('cart.findOne.success'),
            cart
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.CartRead, PermissionList.CartCreate)
    @ResponseStatusCode()
    @Patch('/add-item')
    async addItem(
        @User('_id') userId: string,
        @Body() data: Record<string, any>
    ): Promise<IResponse> {
        let cart: CartDocument = await this.cartService.findOne<CartDocument>({
            user: Types.ObjectId(userId)
        });

        if (!cart) {
            await this.cartService.create(userId);

            cart = await this.cartService.findOne<CartDocument>({
                user: Types.ObjectId(userId)
            });
        }

        const product = await this.productService.findOneById(data.product);
        let index = cart.products.findIndex(
            (val) => `${val.product}` === data.product
        );

        if (index < 0) {
            cart.products.push(data);
            index = cart.products.length - 1;
        } else {
            cart.products[index].quantity =
                cart.products[index].quantity + data.quantity;
        }

        if (product.quantity < cart.products[index].quantity) {
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get(
                        'cart.addItem.quantityMoreThanStock'
                    )
                )
            );
        }

        await this.cartService.updateProducts(cart._id, cart.products);

        return this.responseService.success(
            this.messageService.get('cart.addItem.success'),
            cart
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.CartRead, PermissionList.CartUpdate)
    @ResponseStatusCode()
    @Patch('/remove-item')
    async removeItem(
        @User('_id') userId: string,
        @Body() data: Record<string, any>
    ): Promise<IResponse> {
        const cart: CartDocument = await this.cartService.findOne<CartDocument>(
            {
                user: Types.ObjectId(userId)
            }
        );
        if (!cart) {
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('cart.removeItem.cartNotFound')
                )
            );
        }

        const index = cart.products.findIndex(
            (val) => `${val.product}` === data.product
        );

        if (index < 0) {
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('cart.removeItem.productNotFound')
                )
            );
        }

        if (data.quantity > cart.products[index].quantity) {
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('cart.removeItem.quantityOverlap')
                )
            );
        }

        cart.products[index].quantity =
            cart.products[index].quantity - data.quantity;
        if (cart.products[index].quantity === 0) {
            cart.products.splice(index, 1);
        }

        await this.cartService.updateProducts(cart._id, cart.products);

        return this.responseService.success(
            this.messageService.get('cart.removeItem.success'),
            cart
        );
    }
}
