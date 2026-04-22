import { Mutex } from 'async-mutex';

export class LockManager {
    private static instance: LockManager;
    private locks: Map<string, Mutex> = new Map();

    private constructor() {}

    public static getInstance(): LockManager {
        if (!LockManager.instance) {
            LockManager.instance = new LockManager();
        }
        return LockManager.instance;
    }

    public getLockForRoom(roomId: string): Mutex {
        if (!this.locks.has(roomId)) {
            this.locks.set(roomId, new Mutex());
        }
        return this.locks.get(roomId)!;
    }
}
