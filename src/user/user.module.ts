import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserDatabaseName, UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';
import { CartModule } from 'src/cart/cart.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserEntity.name,
                schema: UserSchema,
                collection: UserDatabaseName
            }
        ]),
        CartModule
    ],
    exports: [UserService],
    providers: [UserService],
    controllers: [UserController]
})
export class UserModule {}
