import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  return NextResponse.next(); // Middleware handles the request
};

export const GET = async (req: NextRequest) => {
  return NextResponse.next(); // Middleware handles the request
};
