import { NextRequest, NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const rawGarage = await islePilotClient.getPlayerGarage(steamId);
    const garage = rawGarage.map((slot) => {
      const stored = adminStore.getGarageSlotMutations(slot.id);
      if (stored) {
        return {
          ...slot,
          mutations: stored.mutations,
          elder: stored.elder || slot.elder,
          isPrimeElder: stored.elder === 'Prime' || slot.isPrimeElder,
          lineage: stored.lineage || slot.lineage,
        };
      }
      return slot;
    });

    return NextResponse.json({ garage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
