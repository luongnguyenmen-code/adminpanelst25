import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/st25/mutations
 * Lấy danh mục 100% các đột biến gen (Mutations) trực tiếp từ database (data/store.json).
 */
export async function GET() {
  const mutations = adminStore.getMutationsCatalog();
  const names = adminStore.getMutationNames();

  return NextResponse.json({
    success: true,
    source: 'database',
    total: mutations.length,
    mutations,
    names,
  });
}

/**
 * POST /api/st25/mutations
 * Thêm hoặc cập nhật mutation mới vào database.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Tên đột biến là bắt buộc' }, { status: 400 });
    }

    adminStore.addMutationToCatalog({
      name: body.name,
      category: body.category || 'Universal',
      description: body.description || '',
    });

    const updated = adminStore.getMutationsCatalog();
    return NextResponse.json({
      success: true,
      message: `Đã lưu đột biến "${body.name}" vào database thành công`,
      total: updated.length,
      mutations: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
