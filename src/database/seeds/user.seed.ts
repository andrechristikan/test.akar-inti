import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';

import { RoleService } from 'src/role/role.service';
import { UserService } from 'src/user/user.service';
import { Hash } from 'src/hash/hash.decorator';
import { HashService } from 'src/hash/hash.service';
import { RoleList } from '../../role/role.constant';

@Injectable()
export class UserSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        @Hash() readonly hashService: HashService,
        private readonly userService: UserService,
        private readonly roleService: RoleService
    ) {}

    @Command({
        command: 'create:user',
        describe: 'insert users',
        autoExit: true
    })
    async create(): Promise<void> {
        const adminRole = await this.roleService.findAll(0, 1, {
            name: RoleList.Admin
        });

        const userRole = await this.roleService.findAll(0, 1, {
            name: RoleList.Customer
        });

        try {
            await this.userService.create({
                firstName: 'admin',
                lastName: 'test',
                email: 'admin@mail.com',
                password: '123456',
                mobileNumber: '08111111111',
                role: adminRole[0]._id
            });

            await this.userService.create({
                firstName: 'andre',
                lastName: 'ck',
                email: 'andreck@mail.com',
                password: '123456',
                mobileNumber: '0811111122',
                role: userRole[0]._id,
                savedPlaces: [
                    {
                        address: 'jalan rumah utama',
                        name: 'rumah',
                        default: true,
                        receiver: 'andreck',
                        receiverPhone: '081219968822'
                    },
                    {
                        address: 'jalan kantor cadangan',
                        name: 'kantor',
                        default: false,
                        receiver: 'andreck',
                        receiverPhone: '081219968822'
                    }
                ]
            });

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
            await this.userService.deleteMany();

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
