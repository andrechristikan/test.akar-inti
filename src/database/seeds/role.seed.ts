import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';

import { PermissionService } from 'src/permission/permission.service';
import { RoleService } from 'src/role/role.service';
import { Types } from 'mongoose';

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
        const permissions = await this.permissionService.findAll(0, 20, {
            name: {
                $in: [
                    'UserCreate',
                    'UserUpdate',
                    'UserRead',
                    'UserDelete',
                    'ProfileUpdate',
                    'ProfileRead',
                    'RoleCreate',
                    'RoleUpdate',
                    'RoleRead',
                    'RoleDelete',
                    'PermissionCreate',
                    'PermissionUpdate',
                    'PermissionRead',
                    'PermissionDelete',
                    'ProductCreate',
                    'ProductUpdate',
                    'ProductRead',
                    'ProductDelete',
                    'ProductList',
                    'CartCreate',
                    'CartUpdate',
                    'CartRead',
                    'CartDelete'
                ]
            }
        });

        if (!permissions || permissions.length === 0) {
            this.logger.error('Go Insert Role Before Insert Roles', {
                class: 'RoleSeed',
                function: 'create'
            });

            return;
        }

        const adminPermissions: Types.ObjectId[] = permissions.map(
            (val) => val._id
        );

        const filterPermission = [
            'ProductList',
            'CartCreate',
            'CartUpdate',
            'CartRead',
            'CartDelete'
        ];
        const userPermissions = permissions.filter((val) =>
            filterPermission.includes(val.name)
        );
        try {
            await this.roleService.createMany([
                {
                    name: 'admin',
                    permissions: adminPermissions
                }
            ]);

            await this.roleService.createMany([
                {
                    name: 'user',
                    permissions: userPermissions
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
            await this.roleService.deleteMany({
                name: { $in: ['admin', 'user'] }
            });

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
