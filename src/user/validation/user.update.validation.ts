import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsArray,
    ArrayMaxSize,
    IsOptional,
    ValidateNested
} from 'class-validator';
import { Default } from 'src/utils/class-validator.decorator';
import { UserSavedPlaces } from '../user.interface';

export class UserUpdateValidation {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    readonly lastName: string;

    readonly savedPlaces: UserSavedPlaces[];
}
