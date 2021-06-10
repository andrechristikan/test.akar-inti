import { Injectable } from '@nestjs/common';
import {
    MongooseOptionsFactory,
    MongooseModuleOptions
} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { DATABASE_URL, DATABASE_NAME } from 'src/database/database.constant';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createMongooseOptions(): MongooseModuleOptions {
        // Env Variable
        const baseUrl = `${
            this.configService.get('database.url') || DATABASE_URL
        }`;
        const databaseName =
            this.configService.get('database.name') || DATABASE_NAME;

        let uri: string = `mongodb://`;
        if (
            this.configService.get('database.user') &&
            this.configService.get('database.password')
        ) {
            uri = `${uri}${this.configService.get(
                'database.user'
            )}:${this.configService.get('database.password')}@`;
        }

        uri = `${uri}${baseUrl}/${databaseName}`;

        console.log(uri);

        mongoose.set('debug', this.configService.get('app.debug') || false);
        return {
            uri,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        };
    }
}
