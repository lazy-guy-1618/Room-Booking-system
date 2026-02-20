export abstract class Room {
    constructor(public roomNumber: string) { }

    abstract getCapacity(): number;
    abstract getRoomType(): string;
}

export class StandardRoom extends Room {
    constructor(roomNumber: string, private capacity: number = 4) {
        super(roomNumber);
    }

    getCapacity(): number {
        return this.capacity;
    }

    getRoomType(): string {
        return 'Standard';
    }
}

export class ConferenceRoom extends Room {
    constructor(roomNumber: string, private capacity: number = 20) {
        super(roomNumber);
    }

    getCapacity(): number {
        return this.capacity;
    }

    getRoomType(): string {
        return 'Conference';
    }
}
