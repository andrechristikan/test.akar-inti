import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
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
