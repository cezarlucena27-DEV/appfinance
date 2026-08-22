import { Injectable } from '@nestjs/common';

const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const HISTORY_MINUTES = 30;

@Injectable()
export class OnlineTracker {
  private lastPing = new Map<string, number>();
  private history: { minute: number; users: Set<string> }[] = [];

  ping(userId: string) {
    if (!userId) return;
    const now = Date.now();
    this.lastPing.set(userId, now);
    this.prune(now);
    const minute = Math.floor(now / 60000);
    let bucket = this.history.find((b) => b.minute === minute);
    if (!bucket) {
      bucket = { minute, users: new Set<string>() };
      this.history.push(bucket);
    }
    bucket.users.add(userId);
  }

  getOnlineUserIds(): string[] {
    const cutoff = Date.now() - ONLINE_WINDOW_MS;
    const online: string[] = [];
    for (const [userId, ts] of this.lastPing) {
      if (ts >= cutoff) online.push(userId);
    }
    return online;
  }

  getLastSeen(userId: string): number | undefined {
    return this.lastPing.get(userId);
  }

  getTimeline(): { label: string; count: number }[] {
    const nowMinute = Math.floor(Date.now() / 60000);
    const timeline: { label: string; count: number }[] = [];
    for (let i = HISTORY_MINUTES - 1; i >= 0; i--) {
      const m = nowMinute - i;
      const bucket = this.history.find((b) => b.minute === m);
      const d = new Date(m * 60000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      timeline.push({ label: `${hh}:${mm}`, count: bucket ? bucket.users.size : 0 });
    }
    return timeline;
  }

  private prune(now: number) {
    const cutoffMinute = Math.floor(now / 60000) - (HISTORY_MINUTES + 1);
    while (this.history.length && this.history[0].minute < cutoffMinute) this.history.shift();
    if (this.lastPing.size > 10000) {
      const cutoff = now - ONLINE_WINDOW_MS;
      for (const [userId, ts] of this.lastPing) {
        if (ts < cutoff) this.lastPing.delete(userId);
      }
    }
  }
}
