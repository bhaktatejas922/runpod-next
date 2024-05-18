import { NextRequest, NextResponse } from 'next/server';
import { routeToRunpod, endpointStore, createEndpoint, checkEndpoint } from './src/runpod';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  if (path.endsWith('_runpod')) {
    let endpointId = endpointStore[path];
    console.log(`Path: ${path}`);
    console.log(`Initial endpointId: ${endpointId}`);

    if (!endpointId) {
      const config = {
        apiKey: process.env.RUNPOD_API_KEY!,
        endpointName: path,
        gpuIds: 'AMPERE_16',
        templateId: process.env.RUNPOD_TEMPLATE_ID!,
      };

      try {
        console.log(`Config: ${JSON.stringify(config)}`);
        let endpoint = await checkEndpoint(config);
        console.log(`Checked endpoint: ${JSON.stringify(endpoint)}`);

        if (!endpoint) {
          endpoint = await createEndpoint(config);
          console.log(`Created endpoint: ${JSON.stringify(endpoint)}`);
        }

        endpointStore[path] = endpoint.id;
        endpointId = endpoint.id;
        console.log(`Updated endpointId: ${endpointId}`);
        console.log(`Updated endpointStore: ${JSON.stringify(endpointStore)}`);
      } catch (error) {
        console.error('Failed to check or create endpoint:', error);
        return new NextResponse('Failed to check or create endpoint', { status: 500 });
      }
    }

    const res = new NextResponse();
    try {
      await routeToRunpod(req as any, res as any);
    } catch (error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
