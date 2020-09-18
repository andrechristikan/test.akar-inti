import { Injectable } from '@nestjs/common';
import { ConfigService } from 'config/config.service';
import { HttpSuccessStatusCode, Pagination } from 'helper/helper.constant';
import { IResponseSuccess, IPagination } from 'helper/helper.interface';
@Injectable()
export class HelperService {
    pagination(setPage: number, setLimit?: number): IPagination {
        const limit: number = Pagination.limit || setLimit;
        const page = setPage || 1;

        const skip: number = (page - 1) * limit;
        return { skip, limit: Number(limit) };
    }

    response(
        httpCode: HttpSuccessStatusCode,
        message: string,
        data?: Record<string, any> | Array<Record<string, any>>,
    ): IResponseSuccess {
        const response: IResponseSuccess = {
            statusCode: httpCode,
            httpCode,
            message,
            data,
        };
        return response;
    }
}
