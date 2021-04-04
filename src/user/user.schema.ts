import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RoleDatabaseName } from 'src/role/role.schema';

@Schema()
export class UserEntity {

    @Prop({
        required: true,
        index: true,
        lowercase: true,
        trim: true
    })
    firstName: string;

    @Prop({
        required: true,
        index: true,
        lowercase: true,
        trim: true
    })
    lastName: string;

    @Prop({
        required: true,
        index: true,
        unique: true,
        trim: true
    })
    mobileNumber: string;

    @Prop({
        required: true,
        index: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    email: string;

    @Prop({
        required: true,
        default: false,
        index: true
    })
    isAdmin: boolean;

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: RoleDatabaseName
    })
    roleId: Types.ObjectId;

    @Prop({
        required: true
    })
    password: string;
}

export const UserDatabaseName = 'users';
export const UserSchema = SchemaFactory.createForClass(UserEntity);
