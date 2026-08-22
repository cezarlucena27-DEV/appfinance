export declare class OnlineTracker {
    private lastPing;
    private history;
    ping(userId: string): void;
    getOnlineUserIds(): string[];
    getLastSeen(userId: string): number | undefined;
    getTimeline(): {
        label: string;
        count: number;
    }[];
    private prune;
}
