import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';

import { PermissionService } from 'src/permission/permission.service';
import { RoleService } from 'src/role/role.service';
import { RoleList } from 'src/role/role.constant';

@Injectable()
export class RoleSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        private readonly permissionService: PermissionService,
        private readonly roleService: RoleService
    ) {}

    @Command({
        command: 'create:role',
        describe: 'insert roles',
        autoExit: true
    })
    async create(): Promise<void> {
        const permissions = await this.permissionService.findAll(0, 100);

        const adminFilterPermission = [
            'UserCreate',
            'UserUpdate',
            'UserRead',
            'UserDelete',
            'RoleRead',
            'ProductCreate',
            'ProductUpdate',
            'ProductRead',
            'ProductDelete',
            'OrderCreate',
            'OrderUpdate',
            'OrderRead',
            'PaymentCreate',
            'PaymentRead',
            'PaymentDelete'
        ];
        const adminPermissions = permissions
            .filter((val) => adminFilterPermission.includes(val.name))
            .map((val) => val._id);

        const customerFilterPermission = [
            'ProfileUpdate',
            'ProfileRead',
            'ProductList',
            'CartCreate',
            'CartUpdate',
            'CartRead',
            'OrderCreate',
            'OrderList',
            'PaymentCreate',
            'PaymentList'
        ];
        const customerPermissions = permissions
            .filter((val) => customerFilterPermission.includes(val.name))
            .map((val) => val._id);

        try {
            await this.roleService.createMany([
                {
                    name: RoleList.Admin,
                    permissions: adminPermissions
                },
                {
                    name: RoleList.Customer,
                    permissions: customerPermissions
                }
            ]);

            this.logger.info('Insert Role Succeed', {
                class: 'RoleSeed',
                function: 'create'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'RoleSeed',
                function: 'create'
            });
        }
    }

    @Command({
        command: 'remove:role',
        describe: 'remove roles',
        autoExit: true
    })
    async remove(): Promise<void> {
        try {
            await this.roleService.deleteMany();

            this.logger.info('Remove Role Succeed', {
                class: 'RoleSeed',
                function: 'remove'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'RoleSeed',
                function: 'remove'
            });
        }
    }
}
