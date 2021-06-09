import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class OrderSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        private readonly orderService: OrderService
    ) {}

    @Command({
        command: 'remove:order',
        describe: 'remove orders',
        autoExit: true
    })
    async remove(): Promise<void> {
        try {
            await this.orderService.deleteMany();

            this.logger.info('Remove Order Succeed', {
                class: 'OrderSeed',
                function: 'remove'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'OrderSeed',
                function: 'remove'
            });
        }
    }
}
