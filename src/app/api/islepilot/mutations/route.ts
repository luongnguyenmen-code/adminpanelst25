import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/db/store';
import { ALL_MUTATION_NAMES, OFFICIAL_EVRIMA_MUTATIONS } from '@/lib/constants/mutations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');

    const logs = adminStore.getMutationLogs();
    const filteredLogs = steamId ? logs.filter((l) => l.targetSteamId === steamId) : logs;
    const mutations = adminStore.getMutationsCatalog();
    const names = adminStore.getMutationNames();

    return NextResponse.json({
      source: 'database',
      logs: filteredLogs,
      catalog: names,
      mutations,
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

