import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from '../utils/validate-config';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  // ——— new vars ———
  @IsUrl({ require_tld: false })
  GET_LEADS_URL: string;

  @IsUrl({ require_tld: false })
  GET_PRODUCTS_URL: string;

  @IsUrl({ require_tld: false })
  ADD_LEAD_URL: string;

  @IsString()
  EXTERNAL_API_KEY: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  EXTERNAL_API_TIMEOUT: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  AFFILIATE_API_TIMEOUT: number;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'Hermes CRM Backend',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    backendDomain: process.env.BACKEND_DOMAIN || 'http://localhost',
    port: process.env.APP_PORT
      ? +process.env.APP_PORT
      : process.env.PORT
        ? +process.env.PORT
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',

    externalApis: {
      leads: {
        url: process.env.GET_LEADS_URL!,
        apiKey: process.env.EXTERNAL_API_KEY!,
        timeout: process.env.EXTERNAL_API_TIMEOUT
          ? +process.env.EXTERNAL_API_TIMEOUT
          : 5000,
      },
      products: {
        url: process.env.GET_PRODUCTS_URL!,
        apiKey: process.env.EXTERNAL_API_KEY!,
        timeout: process.env.EXTERNAL_API_TIMEOUT
          ? +process.env.EXTERNAL_API_TIMEOUT
          : 5000,
      },
      affiliate: {
        url: process.env.ADD_LEAD_URL!,
        apiKey: process.env.EXTERNAL_API_KEY!,
        timeout: process.env.AFFILIATE_API_TIMEOUT
          ? +process.env.AFFILIATE_API_TIMEOUT
          : 5000,
      },
    },
  };
});
