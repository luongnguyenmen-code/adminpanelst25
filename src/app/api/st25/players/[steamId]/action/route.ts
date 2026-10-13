import { NextRequest, NextResponse } from 'next/server';
import { theIsleRcon } from '@/lib/server/rcon';
import { adminStore } from '@/lib/db/store';
import { islePilotClient } from '@/lib/islepilot/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/st25/players/[steamId]/action
 * Thực thi các hành động nóng (Action) trên người chơi qua RCON trực tiếp / fallback.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const body = await request.json();
    const action = body.action as string;
    const actionParams = body.params || {};

    let resultMessage = '';

    switch (action) {
      case 'heal': {
        const cmd = `heal ${steamId}`;
        const res = await theIsleRcon.execute(cmd);
        resultMessage = res.response || 'Đã hồi đầy máu cho người chơi';
        break;
      }

      case 'feed': {
        const cmd = `setstats ${steamId} 5000 1000 1000`;
        const res = await theIsleRcon.execute(cmd);
        resultMessage = res.response || 'Đã hồi đầy thức ăn & nước uống';
        break;
      }

      case 'slay': {
        const cmd = `slay ${steamId}`;
        const res = await theIsleRcon.execute(cmd);
        resultMessage = res.response || 'Đã hạ gục người chơi';
        break;
      }

      case 'teleport': {
        const coords = actionParams.coordinates;
        if (coords && typeof coords.x === 'number') {
          const cmd = `teleport ${steamId} ${coords.x} ${coords.y} ${coords.z || 0}`;
          const res = await theIsleRcon.execute(cmd);
          resultMessage = res.response || `Đã dịch chuyển tới tọa độ (${coords.x}, ${coords.y})`;
        } else {
          throw new Error('Thiếu tọa độ dịch chuyển');
        }
        break;
      }

      case 'revive': {
        const dinoId = actionParams.dinoId;
        const targetDino = dinoId ? adminStore.getDino(dinoId) : undefined;
        const species = actionParams.species || targetDino?.species || 'Tyrannosaurus';
        const growth = actionParams.growth ?? targetDino?.growth ?? 1.0;
        const female = actionParams.gender === 'female' || targetDino?.gender === 'female';
        const mutations = actionParams.mutations || targetDino?.mutations || [];
        const elder = actionParams.elder || targetDino?.elder;

        // 1. Swap
        await theIsleRcon.execute(`swap ${steamId} ${species} ${female}`);
        // 2. Setgrowth
        await theIsleRcon.execute(`setgrowth ${steamId} ${growth}`);
        // 3. Setprime
        if (elder === 'Prime') {
          await theIsleRcon.execute(`setprime ${steamId}`);
        }
        // 4. Mutations
        for (const mut of mutations) {
          if (mut && mut !== '-' && mut !== 'None') {
            await theIsleRcon.execute(`mutations ${steamId} ${mut}`).catch(() => null);
          }
        }
        // 5. Restore coords
        if (targetDino?.coordinates?.x) {
          await theIsleRcon.execute(
            `teleport ${steamId} ${targetDino.coordinates.x} ${targetDino.coordinates.y} ${targetDino.coordinates.z || 0}`
          ).catch(() => null);
        }

        resultMessage = `Đã hồi sinh trọn vẹn khủng long ${species} (${(growth * 100).toFixed(0)}%) với đầy đủ ${mutations.length} gen đột biến!`;
        break;
      }

      case 'back_dino_to_garage': {
        const dinoId = actionParams.dinoId || `dino_${steamId}_${Date.now()}`;
        const existingDino = adminStore.getDino(dinoId);

        const species = actionParams.species || existingDino?.species || 'Tyrannosaurus';
        const growth = actionParams.growth ?? existingDino?.growth ?? 1.0;
        const gender = actionParams.gender || existingDino?.gender || 'male';
        const mutations = actionParams.mutations || existingDino?.mutations || [];

        adminStore.saveDino(dinoId, {
          dinoId,
          steamId,
          species,
          growth,
          gender,
          mutations,
          elder: actionParams.elder || existingDino?.elder,
          lineage: actionParams.lineage || existingDino?.lineage,
        });

        await islePilotClient.restoreDinoToGarageById(steamId, dinoId, {
          species,
          growth,
          gender,
          mutations,
        }).catch(() => null);

        resultMessage = `Đã lưu con khủng long UID #${dinoId} vào Gara thành công!`;
        break;
      }

      default:
        throw new Error(`Hành động không hợp lệ: ${action}`);
    }

    return NextResponse.json({
      success: true,
      action,
      message: resultMessage,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi thực thi hành động' },
      { status: 500 }
    );
  }
}
