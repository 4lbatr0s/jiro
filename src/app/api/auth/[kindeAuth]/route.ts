import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

//INFO: How to implement Kinde Authentication!
export async function GET(
  request: NextRequest,
  { params }: any
): Promise<void | Response> {
  const endpoint = params.kindeAuth;
  const result = await handleAuth(request, endpoint);

  if (result instanceof Response) {
    return result;
  }

  // Handle other cases if needed
  return new NextResponse('Internal Server Error', { status: 500 });
}


