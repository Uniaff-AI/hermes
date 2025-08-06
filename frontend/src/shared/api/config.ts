import { NextResponse } from 'next/server';
import { ENV_CONFIG } from '@/config/envConfig';

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.EXTERNAL_API_URL,
  EXTERNAL_API_KEY: ENV_CONFIG.EXTERNAL_API_KEY,
  VERSION: 'v1',
} as const;

export const getExternalAPIHeaders = () => ({
  'X-API-KEY': API_CONFIG.EXTERNAL_API_KEY!,
  'Content-Type': 'application/json',
});

export const handleAPIError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);

  return NextResponse.json(
    {
      success: false,
      message: `Failed to ${context.toLowerCase()}`,
    },
    { status: 500 }
  );
};

export const createSuccessResponse = (data: unknown) => {
  return NextResponse.json({
    success: true,
    data,
  });
};

export const createExternalAPIUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/${endpoint}`;
};
