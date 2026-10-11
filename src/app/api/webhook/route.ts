import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('[IslePilot Webhook] Received event:', payload.event || 'unknown', payload);

    adminStore.addAuditLog({
      actorId: 'webhook-listener',
      actorName: 'IslePilot Webhook',
      actorRole: 'SUPER_ADMIN',
      action: `WEBHOOK_${(payload.event || 'EVENT').toUpperCase()}`,
      targetSteamId: payload.steamId || payload.victimSteamId,
      targetName: payload.playerName || payload.victimName,
      reason: `Webhook broadcast: ${JSON.stringify(payload).slice(0, 80)}`,
      payload,
    });

    return NextResponse.json({ received: true, event: payload.event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
