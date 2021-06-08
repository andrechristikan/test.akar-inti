import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';

import { RoleService } from 'src/role/role.service';
import { UserService } from 'src/user/user.service';
import { Hash } from 'src/hash/hash.decorator';
import { HashService } from 'src/hash/hash.service';
import { CartService } from 'src/cart/cart.service';
import { UserDocument } from 'src/user/user.interface';

@Injectable()
export class UserSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        @Hash() readonly hashService: HashService,
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly cartService: CartService
    ) {}

    @Command({
        command: 'create:user',
        describe: 'insert users',
        autoExit: true
    })
    async create(): Promise<void> {
        const adminRole = await this.roleService.findAll(0, 1, {
            name: 'admin'
        });

        if (!adminRole || adminRole.length === 0) {
            this.logger.error('Go Insert User Before Insert Roles', {
                class: 'UserSeed',
                function: 'create'
            });

            return;
        }

        const userRole = await this.roleService.findAll(0, 1, {
            name: 'user'
        });

        if (!userRole || userRole.length === 0) {
            this.logger.error('Go Insert User Before Insert Roles', {
                class: 'UserSeed',
                function: 'create'
            });

            return;
        }

        try {
            await this.userService.create({
                firstName: 'admin',
                lastName: 'test',
                email: 'admin@mail.com',
                password: '123456',
                mobileNumber: '08111111111',
                role: adminRole[0]._id
            });

            const user = await this.userService.create({
                firstName: 'andre',
                lastName: 'ck',
                email: 'andreck@mail.com',
                password: '123456',
                mobileNumber: '0811111122',
                role: userRole[0]._id
            });
            await this.cartService.create(user._id);

            this.logger.info('Insert User Succeed', {
                class: 'UserSeed',
                function: 'create'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'UserSeed',
                function: 'create'
            });
        }
    }

    @Command({
        command: 'remove:user',
        describe: 'remove users',
        autoExit: true
    })
    async remove(): Promise<void> {
        try {
            const user: UserDocument = await this.userService.findOne({
                email: 'andreck@mail.com'
            });

            await this.cartService.deleteMany({
                user: user._id
            });
            await this.userService.deleteMany({
                email: 'admin@mail.com'
            });
            await this.userService.deleteMany({
                email: 'andreck@mail.com'
            });

            this.logger.info('Remove User Succeed', {
                class: 'UserSeed',
                function: 'remove'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'UserSeed',
                function: 'remove'
            });
        }
    }
}
