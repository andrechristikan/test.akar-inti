import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MaxLength,
    MinLength,
    IsMongoId,
    IsArray
} from 'class-validator';
import { Types } from 'mongoose';
import { UserSavedPlaces } from 'src/user/user.interface';

export class UserCreateValidation {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    readonly lastName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(13)
    readonly mobileNumber: string;

    @IsMongoId()
    readonly role: Types.ObjectId;

    @IsArray()
    readonly savedPlaces: UserSavedPlaces[];

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    readonly password: string;
}
