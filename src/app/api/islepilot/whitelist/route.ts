import { NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const whitelist = await islePilotClient.getWhitelist();
    return NextResponse.json(whitelist);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
