import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from '@nestjs/i18n';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;
      errorCode = exceptionResponse.error || 'HTTP_EXCEPTION';
    }

    // Try to translate error message
    try {
      const lang = request.headers['accept-language'] || 'en';
      message = await this.i18n.translate(`errors.${errorCode}`, { lang }) || message;
    } catch (translationError) {
      // Fallback to original message if translation fails
    }

    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }
} 