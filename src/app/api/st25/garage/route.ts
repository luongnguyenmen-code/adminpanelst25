import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/db/store';
import { islePilotClient } from '@/lib/islepilot/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/st25/garage
 * Lấy danh sách toàn bộ slot khủng long trong Gara với đầy đủ 16 gen mutations.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let slots = [];
    if (steamId) {
      slots = await islePilotClient.getPlayerGarage(steamId).catch(() => []);
    } else {
      slots = await islePilotClient.getAllServerGarage().catch(() => []);
    }

    // Enrich with adminStore mutations
    const enrichedSlots = slots.map((slot) => {
      const saved = adminStore.getGarageSlotMutations(slot.id);
      return {
        ...slot,
        mutations: saved?.mutations || slot.mutations || [],
        elder: saved?.elder || (slot.isPrimeElder ? 'Prime' : 'No elder'),
        lineage: saved?.lineage || slot.lineage,
      };
    });

    const filtered = search
      ? enrichedSlots.filter(
          (s) =>
            s.species.toLowerCase().includes(search) ||
            s.steamId.includes(search) ||
            s.playerName?.toLowerCase().includes(search) ||
            s.id.toLowerCase().includes(search)
        )
      : enrichedSlots;

    return NextResponse.json({
      success: true,
      total: filtered.length,
      garage: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi lấy danh sách Gara' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/st25/garage
 * Nạp slot khủng long mới vào Gara của người chơi kèm đầy đủ 16 mutations.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { steamId, species, growth, gender, mutations, elder, lineage, playerName } = body;

    if (!steamId) {
      throw new Error('Vui lòng cung cấp steamId của người chơi');
    }

    const slotId = `st25_dino_${steamId.slice(-6)}_${Date.now().toString(36)}`;

    // Save in ST25 DB
    adminStore.saveDino(slotId, {
      dinoId: slotId,
      steamId,
      playerName,
      species: species || 'Tyrannosaurus',
      growth: growth ?? 1.0,
      gender: gender || 'male',
      mutations: mutations || [],
      elder: elder || 'No elder',
      lineage,
    });

    // Also push to IslePilot garage if reachable
    await islePilotClient.addDinoToGarage(steamId, {
      species: species || 'Tyrannosaurus',
      growth: growth ?? 1.0,
      gender: gender || 'male',
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Đã tạo slot khủng long thành công cho người chơi ${steamId}`,
      slotId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi nạp khủng long vào Gara' },
      { status: 500 }
    );
  }
}
