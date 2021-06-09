import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { PermissionModule } from 'src/permission/permission.module';

import { PermissionSeed } from 'src/database/seeds/permission.seed';
import { RoleSeed } from './role.seed';
import { RoleModule } from 'src/role/role.module';
import { UserSeed } from './user.seed';
import { UserModule } from 'src/user/user.module';
import { ProductSeed } from './product.seed';
import { ProductModule } from 'src/product/product.module';
import { CartModule } from 'src/cart/cart.module';
import { CartSeed } from './cart.seed';
import { OrderModule } from 'src/order/order.module';
import { OrderSeed } from './order.seed';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentSeed } from './payment.seed';

@Module({
    imports: [
        CommandModule,
        PermissionModule,
        RoleModule,
        UserModule,
        ProductModule,
        CartModule,
        OrderModule,
        PaymentModule
    ],
    providers: [
        PermissionSeed,
        RoleSeed,
        UserSeed,
        ProductSeed,
        CartSeed,
        OrderSeed,
        PaymentSeed
    ],
    exports: []
})
export class SeedsModule {}
