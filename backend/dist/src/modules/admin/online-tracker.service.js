"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlineTracker = void 0;
const common_1 = require("@nestjs/common");
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const HISTORY_MINUTES = 30;
let OnlineTracker = class OnlineTracker {
    constructor() {
        this.lastPing = new Map();
        this.history = [];
    }
    ping(userId) {
        if (!userId)
            return;
        const now = Date.now();
        this.lastPing.set(userId, now);
        this.prune(now);
        const minute = Math.floor(now / 60000);
        let bucket = this.history.find((b) => b.minute === minute);
        if (!bucket) {
            bucket = { minute, users: new Set() };
            this.history.push(bucket);
        }
        bucket.users.add(userId);
    }
    getOnlineUserIds() {
        const cutoff = Date.now() - ONLINE_WINDOW_MS;
        const online = [];
        for (const [userId, ts] of this.lastPing) {
            if (ts >= cutoff)
                online.push(userId);
        }
        return online;
    }
    getLastSeen(userId) {
        return this.lastPing.get(userId);
    }
    getTimeline() {
        const nowMinute = Math.floor(Date.now() / 60000);
        const timeline = [];
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
    prune(now) {
        const cutoffMinute = Math.floor(now / 60000) - (HISTORY_MINUTES + 1);
        while (this.history.length && this.history[0].minute < cutoffMinute)
            this.history.shift();
        if (this.lastPing.size > 10000) {
            const cutoff = now - ONLINE_WINDOW_MS;
            for (const [userId, ts] of this.lastPing) {
                if (ts < cutoff)
                    this.lastPing.delete(userId);
            }
        }
    }
};
exports.OnlineTracker = OnlineTracker;
exports.OnlineTracker = OnlineTracker = __decorate([
    (0, common_1.Injectable)()
], OnlineTracker);
//# sourceMappingURL=online-tracker.service.js.map