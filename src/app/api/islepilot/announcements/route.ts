import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/db/store';
import { islePilotClient } from '@/lib/islepilot/client';
import {
  processAutoBroadcastTick,
  triggerNextBroadcastNow,
  startAutoAnnouncerScheduler,
} from '@/lib/islepilot/autoAnnouncer';
import { getServerAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Ensure scheduler is active
startAutoAnnouncerScheduler();

export async function GET() {
  try {
    // Process tick if due
    await processAutoBroadcastTick().catch(() => {});

    const templates = adminStore.getAnnouncementTemplates();
    const config = adminStore.getAutoAnnounceConfig();
    const history = adminStore.getBroadcastHistory();

    return NextResponse.json({
      success: true,
      templates,
      config,
      history,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAdminSession();
    const actorName = session?.username || 'Admin';
    const actorRole = session?.role || 'SUPER_ADMIN';

    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case 'send_now': {
        const message = payload?.message?.trim();
        if (!message) {
          return NextResponse.json(
            { success: false, error: 'Nội dung thông báo không được để trống' },
            { status: 400 }
          );
        }

        const res = await islePilotClient.announceServer(message);

        adminStore.addBroadcastHistory({
          content: message,
          source: 'manual',
          senderName: actorName,
          status: res.success ? 'SUCCESS' : 'FAILED',
        });

        adminStore.addAuditLog({
          actorId: session?.id || 'admin-root',
          actorName,
          actorRole,
          action: 'BROADCAST_MANUAL',
          reason: `Gửi thông báo server: ${message.slice(0, 50)}...`,
          payload: { message },
          status: res.success ? 'SUCCESS' : 'FAILED',
        });

        return NextResponse.json({
          success: res.success,
          message: res.message || 'Đã gửi thông báo tới máy chủ',
        });
      }

      case 'save_template': {
        const { id, title, content, category, enabledForAuto } = payload || {};
        if (!title?.trim() || !content?.trim()) {
          return NextResponse.json(
            { success: false, error: 'Tiêu đề và nội dung mẫu không được để trống' },
            { status: 400 }
          );
        }

        const saved = adminStore.saveAnnouncementTemplate({
          id,
          title: title.trim(),
          content: content.trim(),
          category: category || 'general',
          enabledForAuto: enabledForAuto !== false,
        });

        return NextResponse.json({
          success: true,
          template: saved,
          message: id ? 'Cập nhật mẫu thành công' : 'Tạo mẫu mới thành công',
        });
      }

      case 'delete_template': {
        const { id } = payload || {};
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Thiếu ID mẫu để xóa' },
            { status: 400 }
          );
        }

        const deleted = adminStore.deleteAnnouncementTemplate(id);
        return NextResponse.json({
          success: deleted,
          message: deleted ? 'Đã xóa mẫu thông báo' : 'Không tìm thấy mẫu thông báo',
        });
      }

      case 'update_config': {
        const { enabled, intervalMinutes, mode } = payload || {};
        const currentConfig = adminStore.getAutoAnnounceConfig();

        const newInterval =
          typeof intervalMinutes === 'number' && intervalMinutes > 0
            ? intervalMinutes
            : currentConfig.intervalMinutes;

        let nextBroadcastAt = currentConfig.nextBroadcastAt;
        if (enabled && (!currentConfig.enabled || !nextBroadcastAt)) {
          nextBroadcastAt = new Date(Date.now() + newInterval * 60 * 1000).toISOString();
        } else if (!enabled) {
          nextBroadcastAt = undefined;
        }

        const updated = adminStore.updateAutoAnnounceConfig({
          enabled: typeof enabled === 'boolean' ? enabled : currentConfig.enabled,
          intervalMinutes: newInterval,
          mode: mode || currentConfig.mode,
          nextBroadcastAt,
        });

        adminStore.addAuditLog({
          actorId: session?.id || 'admin-root',
          actorName,
          actorRole,
          action: 'AUTO_ANNOUNCE_CONFIG',
          reason: `Cập nhật cấu hình tự động thông báo: ${updated.enabled ? 'BẬT' : 'TẮT'} (Mỗi ${updated.intervalMinutes} phút)`,
          payload: updated,
          status: 'SUCCESS',
        });

        return NextResponse.json({
          success: true,
          config: updated,
          message: 'Cập nhật cấu hình tự động thông báo thành công',
        });
      }

      case 'trigger_next': {
        const result = await triggerNextBroadcastNow(actorName);
        return NextResponse.json({
          success: result.success,
          message: `Đã gửi mẫu "${result.templateTitle}" ngay lập tức`,
          content: result.content,
        });
      }

      case 'clear_history': {
        adminStore.clearBroadcastHistory();
        return NextResponse.json({
          success: true,
          message: 'Đã xóa toàn bộ lịch sử thông báo',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Hành động không hợp lệ: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
