import { NextRequest, NextResponse } from 'next/server';
import { adminStore, DiscordRolePermissionItem, DEFAULT_ST25_ROLES } from '@/lib/db/store';
import { getServerAdminSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { islePilotClient } from '@/lib/islepilot/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');

    const roles = adminStore.getRolePermissions();

    // If steamId provided, find player's discord roles and compute effective permissions
    if (steamId) {
      const player = await islePilotClient.getPlayerDetail(steamId);
      const discordRoles = player?.discord?.roles || [];
      const effectivePermissions = adminStore.getUserEffectivePermissions(discordRoles);

      return NextResponse.json({
        success: true,
        roles,
        playerSimulation: {
          steamId,
          name: player?.name,
          discord: player?.discord,
          discordRoles,
          effectivePermissions,
        },
      });
    }

    return NextResponse.json({
      success: true,
      roles,
      defaults: DEFAULT_ST25_ROLES,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAdminSession();
    if (!session || session.role === 'GUEST') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu đăng nhập tài khoản BQT trước khi cấu hình phân quyền hệ thống!' },
        { status: 401 }
      );
    }

    const actorRole = session.role;

    // Verify permission to manage roles
    if (!hasPermission(actorRole, 'canManageRoles')) {
      return NextResponse.json(
        { success: false, error: 'Từ chối truy cập: Bạn không có quyền quản lý phân quyền hệ thống (canManageRoles)' },
        { status: 403 }
      );
    }


    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      const resetList = adminStore.resetRolePermissionsToDefault();
      return NextResponse.json({
        success: true,
        message: 'Đã khôi phục ma trận phân quyền Discord về mặc định',
        roles: resetList,
      });
    }

    if (action === 'delete') {
      const { roleName } = body;
      if (!roleName) {
        return NextResponse.json({ success: false, error: 'Thiếu roleName cần xóa' }, { status: 400 });
      }
      const ok = adminStore.deleteRolePermission(roleName);
      return NextResponse.json({
        success: ok,
        message: ok ? `Đã xóa role ${roleName}` : 'Không tìm thấy role',
        roles: adminStore.getRolePermissions(),
      });
    }

    if (action === 'simulate') {
      const { roleNames } = body;
      const effective = adminStore.getUserEffectivePermissions(roleNames || []);
      return NextResponse.json({
        success: true,
        effectivePermissions: effective,
      });
    }

    // Default: Save / Update role item
    const { roleName, description, badgeColor, permissions } = body;
    if (!roleName || !permissions) {
      return NextResponse.json(
        { success: false, error: 'Thiếu roleName hoặc bảng permissions' },
        { status: 400 }
      );
    }

    const updated = adminStore.saveRolePermission({
      roleName: roleName.trim(),
      description: description || '',
      badgeColor: badgeColor || '#3b82f6',
      permissions,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Đã lưu cấu hình phân quyền cho role "${updated.roleName}"`,
      role: updated,
      roles: adminStore.getRolePermissions(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
