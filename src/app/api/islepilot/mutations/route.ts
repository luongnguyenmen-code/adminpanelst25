import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/db/store';
import { COMPREHENSIVE_EVRIMA_MUTATIONS } from '@/components/common/HexagonSlot';
import { islePilotClient } from '@/lib/islepilot/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');

    const logs = adminStore.getMutationLogs();
    const filteredLogs = steamId ? logs.filter((l) => l.targetSteamId === steamId) : logs;

    // Get players with mutations from real API data and garage slots
    const allPlayers = await islePilotClient.getPlayers(false).catch(() => []);
    const serverGarage = await islePilotClient.getAllServerGarage().catch(() => []);

    const playersWithMutations = allPlayers
      .map((p) => ({
        steamId: p.steamId,
        name: p.name,
        species: p.species,
        online: p.online,
        mutations: p.mutations || [],
        elder: p.isPrimeElder ? 'Prime' : 'No elder',
      }))
      .filter((p) => p.mutations && p.mutations.length > 0);

    return NextResponse.json({
      logs: filteredLogs,
      playersWithMutations,
      catalog: COMPREHENSIVE_EVRIMA_MUTATIONS,
      totalLogs: filteredLogs.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    adminStore.clearMutationLogs();
    return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ nhật ký cấp bù đột biến' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

