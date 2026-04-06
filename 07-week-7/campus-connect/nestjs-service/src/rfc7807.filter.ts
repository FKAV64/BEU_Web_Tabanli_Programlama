import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class Rfc7807ExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    let detail = 'An unexpected error occurred';
    let title = 'Error';

    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      detail = exceptionResponse.message
        ? Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message.join(', ')
          : exceptionResponse.message
        : 'An error occurred';
      title = exceptionResponse.error || title;
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        title = 'Bad Request';
        break;
      case HttpStatus.UNAUTHORIZED:
        title = 'Unauthorized';
        break;
      case HttpStatus.NOT_FOUND:
        title = 'Not Found';
        break;
      case HttpStatus.CONFLICT:
        title = 'Conflict';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        title = 'Internal Server Error';
        break;
    }

    const rfc7807Format = {
      type: `https://httpstatuses.com/${status}`,
      title: title,
      status: status,
      detail: detail,
      instance: request.url,
    };

    response.status(status).json(rfc7807Format);
  }
}
