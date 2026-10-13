import { NextRequest, NextResponse } from 'next/server';
import { st25PlayerEngine, ST25PlayerUpdatePayload } from '@/lib/server/player-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/st25/players/[steamId]
 * Lấy chi tiết toàn bộ hồ sơ thời gian thực của người chơi (stats, 16 mutations, coords, garage).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const player = await st25PlayerEngine.getPlayer(steamId);

    if (!player) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy người chơi có SteamID ${steamId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      player,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi lấy hồ sơ người chơi' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/st25/players/[steamId]
 * Cập nhật người chơi theo thời gian thực (bơm growth, đổi loài, 16 mutations, elder status...).
 * Thực thi lệnh RCON trực tiếp vào Game Server và đồng bộ cơ sở dữ liệu ST25.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const body: ST25PlayerUpdatePayload = await request.json();

    const updated = await st25PlayerEngine.updatePlayer(steamId, body);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật dữ liệu thời gian thực cho người chơi ${steamId} thành công!`,
      player: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi cập nhật người chơi' },
      { status: 500 }
    );
  }
}
