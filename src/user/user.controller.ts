import {
    Controller,
    Param,
    Get,
    Post,
    Body,
    Delete,
    Put,
    Query,
    BadRequestException,
    InternalServerErrorException,
    DefaultValuePipe,
    ParseIntPipe,
    ParseBoolPipe
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Response, ResponseStatusCode } from 'src/response/response.decorator';
import { ResponseService } from 'src/response/response.service';
import { IResponse, IResponsePaging } from 'src/response/response.interface';
import { RequestValidationPipe } from 'src/pipe/request-validation.pipe';
import { UserCreateValidation } from 'src/user/validation/user.create.validation';
import { UserUpdateValidation } from 'src/user/validation/user.update.validation';
import { AuthJwtGuard, User } from 'src/auth/auth.decorator';
import { IErrors } from 'src/message/message.interface';
import { MessageService } from 'src/message/message.service';
import { Message } from 'src/message/message.decorator';
import { PaginationService } from 'src/pagination/pagination.service';
import { Pagination } from 'src/pagination/pagination.decorator';
import { PAGE, PER_PAGE } from 'src/pagination/pagination.constant';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { UserDocument, UserDocumentFull } from './user.interface';
import { PermissionList } from 'src/permission/permission.constant';
import { Permissions } from 'src/permission/permission.decorator';
import { CartDocument } from 'src/cart/cart.interface';
import { CartService } from 'src/cart/cart.service';
import { Role } from 'src/role/role.decorator';
import { Role as RoleEnum } from 'src/role/role.constant';
import { RoleService } from 'src/role/role.service';
import { RoleDocumentFull } from 'src/role/role.interface';
import { Types } from 'mongoose';

@Controller('/user')
export class UserController {
    constructor(
        @Response() private readonly responseService: ResponseService,
        @Message() private readonly messageService: MessageService,
        @Pagination() private readonly paginationService: PaginationService,
        @Logger() private readonly logger: LoggerService,
        @Role() private readonly roleService: RoleService,
        private readonly userService: UserService,
        private readonly cartService: CartService
    ) {}

    @AuthJwtGuard()
    @Permissions(PermissionList.UserRead)
    @ResponseStatusCode()
    @Get('/')
    async findAll(
        @Query('page', new DefaultValuePipe(PAGE), ParseIntPipe) page: number,
        @Query('perPage', new DefaultValuePipe(PER_PAGE), ParseIntPipe)
        perPage: number
    ): Promise<IResponsePaging> {
        const skip = await this.paginationService.skip(page, perPage);
        const user: UserDocument[] = await this.userService.findAll(
            skip,
            perPage
        );
        const totalData: number = await this.userService.totalData();
        const totalPage = await this.paginationService.totalPage(
            totalData,
            perPage
        );

        return this.responseService.paging(
            this.messageService.get('user.findAll.success'),
            totalData,
            totalPage,
            page,
            perPage,
            user
        );
    }

    @AuthJwtGuard()
    @ResponseStatusCode()
    @Permissions(PermissionList.ProfileRead)
    @Get('/profile')
    async profile(@User('_id') userId: string): Promise<IResponse> {
        const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
            userId,
            true
        );
        if (!user) {
            this.logger.error('user Error', {
                class: 'UserController',
                function: 'profile'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('user.profile.success'),
            user
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.UserRead)
    @ResponseStatusCode()
    @Get('/:userId')
    async findOneById(@Param('userId') userId: string): Promise<IResponse> {
        const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
            userId,
            true
        );
        if (!user) {
            this.logger.error('user Error', {
                class: 'UserController',
                function: 'findOneById'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        return this.responseService.success(
            this.messageService.get('user.findOneById.success'),
            user
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.UserRead, PermissionList.UserCreate)
    @ResponseStatusCode()
    @Post('/create')
    async create(
        @Body(RequestValidationPipe(UserCreateValidation))
        data: Record<string, any>
    ): Promise<IResponse> {
        const errors: IErrors[] = await this.userService.checkExist(
            data.email,
            data.mobileNumber
        );

        if (errors.length > 0) {
            this.logger.error('create errors', {
                class: 'UserController',
                function: 'create',
                errors
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('user.create.error'),
                    errors
                )
            );
        }

        const role = await this.roleService.findOneById<RoleDocumentFull>(
            data.role,
            true
        );
        if (!role) {
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('user.create.roleNotFound')
                )
            );
        }

        try {
            const user: UserDocument = await this.userService.create(data);

            if (role.name !== RoleEnum.Admin) {
                await this.cartService.create(Types.ObjectId(user._id));
            }

            return this.responseService.success(
                this.messageService.get('user.create.success'),
                user
            );
        } catch (err: any) {
            this.logger.error('create try catch', {
                class: 'UserController',
                function: 'create',
                error: err
            });
            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.UserRead, PermissionList.UserDelete)
    @ResponseStatusCode()
    @Delete('/delete/:userId')
    async delete(@Param('userId') userId: string): Promise<IResponse> {
        const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
            userId,
            true
        );
        if (!user) {
            this.logger.error('user Error', {
                class: 'UserController',
                function: 'delete'
            });

            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        await this.userService.deleteOneById(userId);
        await this.cartService.deleteMany({
            user: user._id
        });

        return this.responseService.success(
            this.messageService.get('user.delete.success')
        );
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.UserRead, PermissionList.UserUpdate)
    @ResponseStatusCode()
    @Put('/update/:userId')
    async update(
        @Param('userId') userId: string,
        @Body(RequestValidationPipe(UserUpdateValidation))
        data: UserUpdateValidation
    ): Promise<IResponse> {
        const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
            userId,
            true
        );
        if (!user) {
            this.logger.error('user Error', {
                class: 'UserController',
                function: 'delete'
            });
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        try {
            await this.userService.updateOneById(userId, data);
            const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
                userId,
                true
            );

            return this.responseService.success(
                this.messageService.get('user.update.success'),
                user
            );
        } catch (err: any) {
            this.logger.error('update try catch', {
                class: 'UserController',
                function: 'update',
                error: {
                    ...err
                }
            });

            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }

    @AuthJwtGuard()
    @Permissions(PermissionList.ProfileRead, PermissionList.ProfileUpdate)
    @ResponseStatusCode()
    @Put('/profile-update')
    async profileUpdate(
        @User('_id') userId: string,
        @Body(RequestValidationPipe(UserUpdateValidation))
        data: UserUpdateValidation
    ): Promise<IResponse> {
        const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
            userId,
            true
        );
        if (!user) {
            this.logger.error('user Error', {
                class: 'UserController',
                function: 'delete'
            });
            throw new BadRequestException(
                this.responseService.error(
                    this.messageService.get('http.clientError.notFound')
                )
            );
        }

        try {
            await this.userService.updateOneById(userId, data);
            const user: UserDocumentFull = await this.userService.findOneById<UserDocumentFull>(
                userId,
                true
            );

            return this.responseService.success(
                this.messageService.get('user.update.success'),
                user
            );
        } catch (err: any) {
            this.logger.error('update try catch', {
                class: 'UserController',
                function: 'update',
                error: {
                    ...err
                }
            });

            throw new InternalServerErrorException(
                this.responseService.error(
                    this.messageService.get(
                        'http.serverError.internalServerError'
                    )
                )
            );
        }
    }
}
