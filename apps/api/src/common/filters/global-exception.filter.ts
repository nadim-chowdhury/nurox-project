import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // In production, we don't want to leak internal error details
    const isProduction = process.env.NODE_ENV === 'production';
    const messageText =
      typeof message === 'object' && message !== null && 'message' in message
        ? (message as { message: string }).message
        : message;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        status === (HttpStatus.INTERNAL_SERVER_ERROR as number) && isProduction
          ? 'Internal server error'
          : messageText,
    };

    // Log the error
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
