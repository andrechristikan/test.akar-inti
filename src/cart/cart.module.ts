import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartDatabaseName, CartEntity, CartSchema } from './cart.schema';
import { CartController } from './cart.controller';
import { ProductModule } from 'src/product/product.module';

@Module({
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
    imports: [
        MongooseModule.forFeature([
            {
                name: CartEntity.name,
                schema: CartSchema,
                collection: CartDatabaseName
            }
        ]),
        ProductModule
    ]
})
export class CartModule {}
