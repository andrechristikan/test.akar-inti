import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderDatabaseName, OrderEntity, OrderSchema } from './order.schema';
import { CartModule } from 'src/cart/cart.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ProductModule } from 'src/product/product.module';

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
        CartModule,
        forwardRef(() => PaymentModule),
        CartModule,
        ProductModule
    ]
})
export class OrderModule {}
