import { NextRequest, NextResponse } from 'next/server';
import { st25PlayerEngine } from '@/lib/server/player-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/st25/players
 * Lấy danh sách toàn bộ người chơi theo thời gian thực với đầy đủ 16 mutation slots.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlineOnly = searchParams.get('online') === 'true';
    const search = searchParams.get('search') || '';

    const players = await st25PlayerEngine.getAllPlayers(onlineOnly, search);

    return NextResponse.json({
      success: true,
      total: players.length,
      players,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi lấy danh sách người chơi' },
      { status: 500 }
    );
  }
}
