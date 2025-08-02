import { NextResponse } from 'next/server';

export const API_CONFIG = {
  BASE_URL: process.env.API_SCHEME_URL,
  API_KEY: process.env.API_KEY,
  VERSION: 'v1',
} as const;

export const getExternalAPIHeaders = () => ({
  'X-API-KEY': API_CONFIG.API_KEY!,
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
