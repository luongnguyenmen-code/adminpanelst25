import { NextRequest, NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlineOnly = searchParams.get('online') === 'true';
    const search = searchParams.get('search') || '';

    // Fetch REAL players from IslePilot API directly
    const rawPlayers = await islePilotClient.getPlayers(onlineOnly, search);

    // Enrich players with full database mutations and elder state from ST25 DB
    const enrichedPlayers = rawPlayers.map((p) => {
      const savedMuts = adminStore.getPlayerMutations(p.steamId);
      if (savedMuts) {
        const allMuts = [
          ...(savedMuts.mutations || []),
          ...(savedMuts.lineage?.parent || []),
          ...(savedMuts.lineage?.elderA || []),
          ...(savedMuts.lineage?.elderB || []),
        ].filter((m): m is string => Boolean(m && m !== '-' && m !== 'None'));

        return {
          ...p,
          mutations: allMuts.length > 0 ? allMuts : p.mutations,
          elder: savedMuts.elder || p.elder,
          isPrimeElder: savedMuts.elder === 'Prime' || p.isPrimeElder,
        };
      }
      return p;
    });

    return NextResponse.json({ players: enrichedPlayers, total: enrichedPlayers.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
