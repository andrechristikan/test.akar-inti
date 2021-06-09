import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
    PaymentDatabaseName,
    PaymentEntity,
    PaymentSchema
} from './payment.schema';
import { OrderModule } from 'src/order/order.module';

@Module({
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService],
    imports: [
        MongooseModule.forFeature([
            {
                name: PaymentEntity.name,
                schema: PaymentSchema,
                collection: PaymentDatabaseName
            }
        ]),
        forwardRef(() => OrderModule)
    ]
})
export class PaymentModule {}
