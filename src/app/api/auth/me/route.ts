import { NextResponse } from 'next/server';
import { getServerAdminSession } from '@/lib/auth/session';
import { ROLE_PERMISSIONS } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAdminSession();
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        session: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      session,
      permissions: ROLE_PERMISSIONS[session.role],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
