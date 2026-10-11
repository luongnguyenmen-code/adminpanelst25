import { NextResponse } from 'next/server';
import { getServerAdminSession } from '@/lib/auth/session';
import { ROLE_PERMISSIONS } from '@/lib/auth/rbac';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAdminSession();
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        session: null,
        permissions: ROLE_PERMISSIONS.TRIAL_MOD,
      });
    }

    // 1. Base RBAC permissions
    const basePermissions = ROLE_PERMISSIONS[session.role] || ROLE_PERMISSIONS.TRIAL_MOD;

    // 2. Realtime Discord RBAC permissions calculated from active store matrix
    const discordRoles = session.discordRoles || [];
    const dynamicPermissions = discordRoles.length > 0 
      ? adminStore.getUserEffectivePermissions(discordRoles)
      : null;

    // 3. Merged effective permissions (Dynamic matrix overrides / augments base role)
    const effectivePermissions = dynamicPermissions 
      ? { ...basePermissions, ...dynamicPermissions }
      : basePermissions;

    return NextResponse.json({
      authenticated: true,
      session,
      permissions: effectivePermissions,
      discordRoles,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

