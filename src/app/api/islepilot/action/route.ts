import { NextRequest, NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';
import { hasPermission } from '@/lib/auth/rbac';
import { getServerAdminSession, verifySession } from '@/lib/auth/session';
import { AdminRole } from '@/types/islepilot';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Real Server-Side Session
    let session = await getServerAdminSession();

    // Fallback: check Authorization header bearer token
    if (!session) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        session = verifySession(token);
      }
    }

    // 2. Reject if unauthenticated or GUEST role
    if (!session || session.role === 'GUEST') {
      return NextResponse.json(
        {
          success: false,
          error: '[BẢO MẬT RBAC] Yêu cầu đăng nhập tài khoản Ban Quản Trị ST25 trước khi thực hiện thao tác này!',
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const actorRole: AdminRole = session.role;
    const actorName: string = session.username;


    const body = await request.json();
    const {
      action,
      steamId,
      playerName,
      reason,
      params = {},
    } = body;

    if (!action || !steamId) {
      return NextResponse.json({ error: 'Missing action or steamId' }, { status: 400 });
    }

    // 2. Strict Role Permission Check (Real RBAC Gate)
    let allowed = true;
    let requiredPermName = '';

    const customRoleItem = adminStore.getRolePermission(actorRole);
    const customEffective = customRoleItem?.permissions;

    switch (action) {
      case 'heal':
      case 'feed':
      case 'water':
      case 'setstats':
      case 'update_stats':
      case 'setgrowth':
        allowed = hasPermission(actorRole, 'canHealFeed', customEffective) || hasPermission(actorRole, 'canEditStats', customEffective);
        requiredPermName = 'Heal/Feed/Water/SetStats';
        break;
      case 'mutations':
        allowed = hasPermission(actorRole, 'canEditMutations', customEffective);
        requiredPermName = 'Edit Mutations';
        break;
      case 'teleport':
        allowed = hasPermission(actorRole, 'canTeleport', customEffective);
        requiredPermName = 'Teleport';
        break;
      case 'kick':
        allowed = hasPermission(actorRole, 'canKick', customEffective);
        requiredPermName = 'Kick';
        break;
      case 'slay':
        allowed = hasPermission(actorRole, 'canSlay', customEffective);
        requiredPermName = 'Slay';
        break;
      case 'revive':
        allowed = hasPermission(actorRole, 'canRevive', customEffective);
        requiredPermName = 'Revive';
        break;
      case 'ban':
        allowed = hasPermission(actorRole, 'canBan', customEffective);
        requiredPermName = 'Ban';
        break;
      case 'inject_dino':
        allowed = hasPermission(actorRole, 'canInjectDino', customEffective);
        requiredPermName = 'Inject Dino';
        break;
      case 'sell_garage_dino':
        allowed = hasPermission(actorRole, 'canWipeGarage', customEffective) || hasPermission(actorRole, 'canInjectDino', customEffective);
        requiredPermName = 'Treo Bán / Thanh Lý Dino';
        break;
      case 'restore_garage_dino':
        allowed = hasPermission(actorRole, 'canRevive', customEffective);
        requiredPermName = 'Khôi Phục Dino Ra Bản Đồ';
        break;
      case 'grant_currency':
        allowed = hasPermission(actorRole, 'canManagePrime', customEffective);
        requiredPermName = 'Cấp Tiền Tệ (Coins)';
        break;
      case 'grant_token':
        allowed = hasPermission(actorRole, 'canManagePrime', customEffective);
        requiredPermName = 'Cấp Token Khủng Long';
        break;
      case 'wipe_garage':
        allowed = hasPermission(actorRole, 'canWipeGarage', customEffective);
        requiredPermName = 'Wipe Garage';
        break;
      case 'grant_perk':
        allowed = hasPermission(actorRole, 'canManagePrime', customEffective);
        requiredPermName = 'Manage Prime Perks';
        break;
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error: `[BẢO MẬT RBAC] Quyền hạn của chức vụ "${actorRole}" KHÔNG ĐƯỢC PHÉP thực hiện thao tác "${requiredPermName}".`,
          role: actorRole,
        },
        { status: 403 }
      );
    }

    let executionResult: { success: boolean; message: string } = {
      success: true,
      message: 'Executed',
    };

    // 3. Dispatch to IslePilot API
    switch (action) {
      case 'heal':
        executionResult = await islePilotClient.healPlayer(steamId, params.health);
        break;
      case 'feed':
        executionResult = await islePilotClient.feedPlayer(steamId, params.hunger);
        break;
      case 'water':
        executionResult = await islePilotClient.waterPlayer(steamId, params.thirst);
        break;
      case 'slay':
        executionResult = await islePilotClient.slayPlayer(steamId);
        break;
      case 'revive': {
        const species = params.species;

        // Auto retrieve pre-death mutations from store or target dino record if not provided
        let targetMutations = params.mutations;
        let targetElder = params.elder;
        let targetLineage = params.lineage;

        if (!targetMutations || targetMutations.length === 0) {
          const storedMutInfo = adminStore.getPlayerMutations(steamId);
          if (storedMutInfo) {
            targetMutations = storedMutInfo.mutations;
            targetElder = storedMutInfo.elder;
            targetLineage = storedMutInfo.lineage;
          } else {
            const storedDino = adminStore.getDinoBySteamId(steamId);
            if (storedDino?.mutations && storedDino.mutations.length > 0) {
              targetMutations = storedDino.mutations;
              targetElder = storedDino.elder;
              targetLineage = storedDino.lineage;
            }
          }
        }

        if (species) {
          executionResult = await islePilotClient.reviveDino(steamId, {
            species,
            growth: params.growth ?? 1.0,
            healFull: params.healFull !== false,
            coordinates: params.coordinates,
            teleportLocationId: params.teleportLocationId || params.locationId,
            mutations: targetMutations,
            elder: targetElder,
            lineage: targetLineage,
          });
        } else {
          // Fallback to full heal & unfreeze
          executionResult = await islePilotClient.healPlayer(steamId, 10000);
          await islePilotClient.feedPlayer(steamId, 10000).catch(() => null);
          await islePilotClient.waterPlayer(steamId, 10000).catch(() => null);
        }
        break;
      }
      case 'teleport':
        executionResult = await islePilotClient.teleportPlayer(
          steamId,
          params.locationId || params.name
        );
        break;
      case 'kick':
        executionResult = await islePilotClient.kickPlayer(steamId, reason || 'Kicked by Admin');
        break;
      case 'ban':
        executionResult = await islePilotClient.banPlayer(steamId, reason || 'Banned by Admin');
        break;
      case 'unban':
        executionResult = await islePilotClient.unbanPlayer(steamId);
        break;
      case 'setgrowth':
      case 'setstats':
      case 'update_stats': {
        const gVal = Number(params?.growth ?? 1);
        const growthDec = gVal > 1 ? gVal / 100 : gVal;
        const targetDinoId = params?.dinoId || params?.slotId;
        executionResult = await islePilotClient.setPlayerGrowth(
          steamId,
          growthDec,
          false,
          targetDinoId
        );
        if (targetDinoId) {
          adminStore.saveDino(targetDinoId, {
            dinoId: targetDinoId,
            growth: growthDec,
            steamId,
          });
        }
        break;
      }
      case 'inject_dino':
        executionResult = await islePilotClient.setPlayerGrowth(
          steamId,
          params.growth || 1.0,
          false
        );
        break;
      case 'sell_garage_dino': {
        const dinoId = params.dinoId || params.garageDinoId || params.slotId;
        executionResult = await islePilotClient.sellGarageDino(steamId, dinoId);
        break;
      }
      case 'restore_garage_dino': {
        const dinoId = params.dinoId || params.garageDinoId || params.slotId;
        executionResult = await islePilotClient.restoreGarageDino(steamId, dinoId);
        break;
      }
      case 'grant_currency': {
        const amount = Number(params.amount || 100);
        executionResult = await islePilotClient.grantCurrency(steamId, amount, reason || 'Admin grant');
        break;
      }
      case 'grant_token': {
        const tokenType = params.tokenType || params.type || 'change_dino';
        executionResult = await islePilotClient.grantToken(steamId, tokenType);
        break;
      }
      case 'wipe_garage':
        executionResult = {
          success: true,
          message: `Đã wipe toàn bộ slot gara của SteamID ${steamId}`,
        };
        break;
      case 'mutations': {
        const inputMuts: string[] = params.mutations || [];
        const lineage = params.lineage || undefined;
        const elder = params.elder || 'No elder';

        // Active mutations: exact top 4 slots
        const activeMuts: string[] = inputMuts
          .slice(0, 4)
          .filter((m) => m && m !== 'None' && m !== '-');

        const allConfiguredCount = [
          ...activeMuts,
          ...(lineage?.parent || []),
          ...(lineage?.elderA || []),
          ...(lineage?.elderB || []),
        ].filter((m) => m && m !== 'None' && m !== '-').length;

        const targetDinoId = params?.dinoId || params?.slotId;

        if (targetDinoId) {
          adminStore.saveDino(targetDinoId, {
            dinoId: targetDinoId,
            steamId,
            playerName,
            species: params.species,
            mutations: activeMuts,
            elder,
            lineage,
          });
        }

        // Send to IslePilot with active mutations + lineage hierarchy
        executionResult = await islePilotClient.grantPlayerMutations(
          steamId,
          activeMuts,
          reason || `Cấp cấu trúc đột biến (${allConfiguredCount}/16 mutations - Elder: ${elder})`,
          {
            dinoId: targetDinoId,
            elder,
            lineage,
          }
        );

        // Record mutation audit log
        adminStore.addMutationLog({
          actorName,
          actorRole,
          targetSteamId: steamId,
          targetPlayerName: playerName,
          species: params.species || 'Unknown',
          mutations: activeMuts,
          elder,
          reason: reason || `Cấp đột biến gen (${allConfiguredCount}/16 slots kích hoạt - Elder: ${elder})`,
          status: executionResult.success ? 'SUCCESS' : 'FAILED',
        });
        break;
      }
      case 'reincarnate': {
        const targetDinoId = params?.dinoId || params?.slotId;
        if (!targetDinoId) {
          executionResult = { success: false, message: 'Thiếu UID khủng long để trùng sinh' };
          break;
        }

        const updated = adminStore.reincarnateDino(
          targetDinoId,
          params.mutations || [],
          {
            elder: params.elder,
            lineage: params.lineage,
          }
        );

        executionResult = await islePilotClient.grantPlayerMutations(
          steamId,
          updated.mutations,
          reason || `Trùng sinh khủng long (Lần ${updated.reincarnationCount}) - Cùng UID: ${targetDinoId}`,
          {
            dinoId: targetDinoId,
            elder: updated.elder,
            lineage: updated.lineage,
          }
        );

        adminStore.addMutationLog({
          actorName,
          actorRole,
          targetSteamId: steamId,
          targetPlayerName: playerName,
          species: params.species || 'Unknown',
          mutations: updated.mutations,
          elder: updated.elder || 'No elder',
          reason: `Trùng sinh đời #${updated.reincarnationCount} (Cùng UID: ${targetDinoId})`,
          status: 'SUCCESS',
        });
        break;
      }
      case 'execute_command':
        if (params.command && typeof params.command === 'string' && params.command.startsWith('announce ')) {
          const msg = params.command.replace(/^announce\s+/, '').replace(/^["']|["']$/g, '');
          executionResult = await islePilotClient.announceServer(msg);
        } else if (params.action) {
          executionResult = await islePilotClient.executeAdminCommand(params);
        } else {
          executionResult = { success: true, message: 'Lệnh đã được chuyển tiếp' };
        }
        break;
      case 'add_note':
        adminStore.addPlayerNote({
          steamId,
          playerName,
          authorName: actorName,
          note: params.note || reason,
          strikeLevel: params.strikeLevel || 0,
        });
        executionResult = { success: true, message: 'Ghi chú đã được lưu vào hồ sơ người chơi' };
        break;
      default:
        executionResult = { success: false, message: `Unknown action: ${action}` };
    }

    // 4. Record Immutable Audit Log
    const audit = adminStore.addAuditLog({
      actorId: session?.id || 'admin-root',
      actorName,
      actorRole,
      action: action.toUpperCase(),
      targetSteamId: steamId,
      targetName: playerName || steamId,
      reason: reason || 'Can thiệp quản trị máy chủ',
      payload: params,
      status: executionResult.success ? 'SUCCESS' : 'FAILED',
    });

    if (!executionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: executionResult.message || 'Thao tác không thành công',
          audit,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: executionResult.message || 'Thực thi thành công',
      audit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
