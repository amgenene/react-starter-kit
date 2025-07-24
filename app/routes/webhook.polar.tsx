import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Forward the webhook to Convex HTTP handler
    const convexUrl = process.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site');
    if (!convexUrl) {
      throw new Error('CONVEX_URL not configured');
    }

    const response = await fetch(`${convexUrl}/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
      body: await request.text(),
    });

    if (!response.ok) {
      throw new Error(`Convex webhook failed: ${response.status}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}