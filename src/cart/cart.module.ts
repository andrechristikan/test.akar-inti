import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartDatabaseName, CartEntity, CartSchema } from './cart.schema';

@Module({
    providers: [CartService],
    exports: [CartService],
    imports: [
        MongooseModule.forFeature([
            {
                name: CartEntity.name,
                schema: CartSchema,
                collection: CartDatabaseName
            }
        ])
    ]
})
export class CartModule {}
