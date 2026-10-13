import { NextResponse } from 'next/server';
import { OFFICIAL_EVRIMA_MUTATIONS, ALL_MUTATION_NAMES } from '@/lib/constants/mutations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/st25/mutations
 * Trả về danh mục chuẩn 100% tất cả các đột biến gen (Mutations) có trong The Isle Evrima.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    total: OFFICIAL_EVRIMA_MUTATIONS.length,
    mutations: OFFICIAL_EVRIMA_MUTATIONS,
    names: ALL_MUTATION_NAMES,
  });
}
