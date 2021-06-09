import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Logger as LoggerService } from 'winston';
import { Logger } from 'src/logger/logger.decorator';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class PaymentSeed {
    constructor(
        @Logger() private readonly logger: LoggerService,
        private readonly paymentService: PaymentService
    ) {}

    @Command({
        command: 'remove:payment',
        describe: 'remove payments',
        autoExit: true
    })
    async remove(): Promise<void> {
        try {
            await this.paymentService.deleteMany();

            this.logger.info('Remove Payment Succeed', {
                class: 'PaymentSeed',
                function: 'remove'
            });
        } catch (e) {
            this.logger.error(e.message, {
                class: 'PaymentSeed',
                function: 'remove'
            });
        }
    }
}
