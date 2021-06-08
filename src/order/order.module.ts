import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderDatabaseName, OrderEntity, OrderSchema } from './order.schema';
import { CartModule } from 'src/cart/cart.module';

@Module({
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
    imports: [
        MongooseModule.forFeature([
            {
                name: OrderEntity.name,
                schema: OrderSchema,
                collection: OrderDatabaseName
            }
        ]),
        CartModule
    ]
})
export class OrderModule {}
