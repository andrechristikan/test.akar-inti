import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';

import { PermissionService } from 'src/permission/permission.service';

@Injectable()
export class PermissionSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        private readonly permissionService: PermissionService
    ) {}

    @Command({
        command: 'create:permission',
        describe: 'insert permissions',
        autoExit: true
    })
    async create(): Promise<void> {
        try {
            await this.permissionService.createMany([
                {
                    name: 'UserCreate'
                },
                {
                    name: 'UserUpdate'
                },
                {
                    name: 'UserRead'
                },
                {
                    name: 'UserDelete'
                },
                {
                    name: 'ProfileUpdate'
                },
                {
                    name: 'ProfileRead'
                },
                {
                    name: 'RoleCreate'
                },
                {
                    name: 'RoleUpdate'
                },
                {
                    name: 'RoleRead'
                },
                {
                    name: 'RoleDelete'
                },
                {
                    name: 'PermissionCreate'
                },
                {
                    name: 'PermissionUpdate'
                },
                {
                    name: 'PermissionRead'
                },
                {
                    name: 'PermissionDelete'
                },
                {
                    name: 'ProductCreate'
                },
                {
                    name: 'ProductUpdate'
                },
                {
                    name: 'ProductRead'
                },
                {
                    name: 'ProductDelete'
                },
                {
                    name: 'ProductList'
                },
                {
                    name: 'CartCreate'
                },
                {
                    name: 'CartUpdate'
                },
                {
                    name: 'CartRead'
                },
                {
                    name: 'CartDelete'
                },

                {
                    name: 'OrderCreate'
                },
                {
                    name: 'OrderUpdate'
                },
                {
                    name: 'OrderRead'
                },
                {
                    name: 'OrderList'
                },
                {
                    name: 'OrderDelete'
                }
            ]);

            this.logger.info('Insert Permission Succeed', {
                class: 'PermissionSeed',
                function: 'create'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'PermissionSeed',
                function: 'create'
            });
        }
    }

    @Command({
        command: 'remove:permission',
        describe: 'remove permissions',
        autoExit: true
    })
    async remove(): Promise<void> {
        try {
            await this.permissionService.deleteMany({
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
                        'CartDelete',
                        'OrderCreate',
                        'OrderUpdate',
                        'OrderRead',
                        'OrderList',
                        'OrderDelete'
                    ]
                }
            });

            this.logger.info('Remove Permission Succeed', {
                class: 'PermissionSeed',
                function: 'remove'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'PermissionSeed',
                function: 'remove'
            });
        }
    }
}
