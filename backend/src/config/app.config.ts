import { registerAs } from '@nestjs/config';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import validateConfig from '../utils/validate-config';
import { AppConfig } from './app-config.type';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvValidator {
  @IsEnum(Environment) @IsOptional() NODE_ENV!: Environment;
  @IsString() @IsOptional() APP_NAME!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  @Type(() => Number)
  APP_PORT!: number;
  @IsInt() @Min(0) @Max(65535) @IsOptional() @Type(() => Number) PORT!: number;

  @IsUrl({ require_tld: false }) @IsOptional() FRONTEND_DOMAIN!: string;
  @IsUrl({ require_tld: false }) @IsOptional() BACKEND_DOMAIN!: string;

  @IsString() @IsOptional() API_PREFIX!: string;
  @IsString() @IsOptional() APP_FALLBACK_LANGUAGE!: string;
  @IsString() @IsOptional() APP_HEADER_LANGUAGE!: string;

  @IsUrl({ require_tld: false }) GET_LEADS_URL!: string;
  @IsUrl({ require_tld: false }) GET_PRODUCTS_URL!: string;
  @IsUrl({ require_tld: false }) ADD_LEAD_URL!: string;

  @IsString() EXTERNAL_API_KEY!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  EXTERNAL_API_TIMEOUT!: number;
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  AFFILIATE_API_TIMEOUT!: number;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvValidator);

  const nodeEnv =
    (process.env.NODE_ENV as Environment) || Environment.Development;
  const isDevelopment = nodeEnv === Environment.Development;
  const isProduction = nodeEnv === Environment.Production;
  const isTest = nodeEnv === Environment.Test;

  const port = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3000;

  const frontendDomain =
    process.env.FRONTEND_DOMAIN ||
    (isDevelopment ? 'http://localhost:3000' : 'https://dev.uniaffcrm.com');

  const backendDomain =
    process.env.BACKEND_DOMAIN ||
    (isDevelopment ? 'http://localhost:3001' : 'https://dev.uniaffcrm.com/api');

  return {
    nodeEnv,
    isDevelopment,
    isProduction,
    isTest,
    name: process.env.APP_NAME || 'Hermes CRM Backend',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain,
    backendDomain,
    port,
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',

    externalApis: {
      leads: {
        url: process.env.GET_LEADS_URL!,
        apiKey: process.env.EXTERNAL_API_KEY!,
        timeout: process.env.EXTERNAL_API_TIMEOUT
          ? parseInt(process.env.EXTERNAL_API_TIMEOUT, 10)
          : 5000,
      },
      products: {
        url: process.env.GET_PRODUCTS_URL!,
        apiKey: process.env.EXTERNAL_API_KEY!,
        timeout: process.env.EXTERNAL_API_TIMEOUT
          ? parseInt(process.env.EXTERNAL_API_TIMEOUT, 10)
          : 5000,
      },
      affiliate: {
        url: process.env.ADD_LEAD_URL!,
        apiKey: process.env.EXTERNAL_API_KEY!,
        timeout: process.env.AFFILIATE_API_TIMEOUT
          ? parseInt(process.env.AFFILIATE_API_TIMEOUT, 10)
          : 5000,
      },
    },
  };
});
