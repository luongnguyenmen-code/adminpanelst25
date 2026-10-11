import { adminStore } from '@/lib/db/store';
import { islePilotClient } from '@/lib/islepilot/client';

declare global {
  // eslint-disable-next-line no-var
  var __autoAnnouncerInitialized: boolean | undefined;
  // eslint-disable-next-line no-var
  var __autoAnnouncerTimer: NodeJS.Timeout | undefined;
}

export async function processAutoBroadcastTick(): Promise<{
  triggered: boolean;
  message?: string;
  templateTitle?: string;
}> {
  const config = adminStore.getAutoAnnounceConfig();
  if (!config.enabled) {
    return { triggered: false, message: 'Auto announcer is disabled' };
  }

  const templates = adminStore
    .getAnnouncementTemplates()
    .filter((t) => t.enabledForAuto);

  if (templates.length === 0) {
    return { triggered: false, message: 'No enabled templates for auto-broadcasting' };
  }

  const now = Date.now();
  const nextTime = config.nextBroadcastAt ? new Date(config.nextBroadcastAt).getTime() : 0;

  // If nextBroadcastAt is not set or in the past, time to send!
  if (!nextTime || now >= nextTime) {
    let selectedIndex = 0;
    if (config.mode === 'random') {
      selectedIndex = Math.floor(Math.random() * templates.length);
    } else {
      selectedIndex = (config.currentTemplateIndex || 0) % templates.length;
    }

    const template = templates[selectedIndex];
    const nextIndex = (selectedIndex + 1) % templates.length;
    const nextBroadcastAt = new Date(now + Math.max(1, config.intervalMinutes) * 60 * 1000).toISOString();

    let executionSuccess = false;
    try {
      const res = await islePilotClient.announceServer(template.content);
      executionSuccess = res.success;
    } catch (err) {
      console.warn('[AutoAnnouncer] Broadcast failed:', err);
      executionSuccess = false;
    }

    adminStore.addBroadcastHistory({
      content: template.content,
      source: 'auto',
      senderName: 'Hệ thống ST25 (Auto)',
      status: executionSuccess ? 'SUCCESS' : 'FAILED',
    });

    adminStore.updateAutoAnnounceConfig({
      lastBroadcastAt: new Date(now).toISOString(),
      nextBroadcastAt,
      currentTemplateIndex: nextIndex,
    });

    return {
      triggered: true,
      message: template.content,
      templateTitle: template.title,
    };
  }

  return { triggered: false, message: 'Not yet time for next broadcast' };
}

export async function triggerNextBroadcastNow(senderName = 'Admin'): Promise<{
  success: boolean;
  content: string;
  templateTitle: string;
}> {
  const config = adminStore.getAutoAnnounceConfig();
  const templates = adminStore
    .getAnnouncementTemplates()
    .filter((t) => t.enabledForAuto);

  if (templates.length === 0) {
    throw new Error('Chưa có mẫu thông báo nào được bật chế độ tự động');
  }

  let selectedIndex = 0;
  if (config.mode === 'random') {
    selectedIndex = Math.floor(Math.random() * templates.length);
  } else {
    selectedIndex = (config.currentTemplateIndex || 0) % templates.length;
  }

  const template = templates[selectedIndex];
  const nextIndex = (selectedIndex + 1) % templates.length;
  const now = Date.now();
  const nextBroadcastAt = new Date(now + Math.max(1, config.intervalMinutes) * 60 * 1000).toISOString();

  const res = await islePilotClient.announceServer(template.content);

  adminStore.addBroadcastHistory({
    content: template.content,
    source: 'manual',
    senderName,
    status: res.success ? 'SUCCESS' : 'FAILED',
  });

  adminStore.updateAutoAnnounceConfig({
    lastBroadcastAt: new Date(now).toISOString(),
    nextBroadcastAt,
    currentTemplateIndex: nextIndex,
  });

  return {
    success: res.success,
    content: template.content,
    templateTitle: template.title,
  };
}

export function startAutoAnnouncerScheduler() {
  if (typeof window !== 'undefined') return;
  if (global.__autoAnnouncerInitialized) return;

  global.__autoAnnouncerInitialized = true;

  if (global.__autoAnnouncerTimer) {
    clearInterval(global.__autoAnnouncerTimer);
  }

  // Check every 15 seconds
  global.__autoAnnouncerTimer = setInterval(() => {
    processAutoBroadcastTick().catch((err) => {
      console.warn('[AutoAnnouncer] Tick error:', err);
    });
  }, 15000);
}

// Auto-start timer on module import
startAutoAnnouncerScheduler();
