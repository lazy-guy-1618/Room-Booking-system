import { Room, StandardRoom, ConferenceRoom } from './Room';

export interface Booking {
    id: string;
    roomId: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
}

export class BookingSystem {
    private static instance: BookingSystem;
    private rooms: Room[] = [];
    private bookings: Booking[] = [];

    private constructor() {
        // Initialize with some dummy rooms
        this.rooms.push(new StandardRoom('101'));
        this.rooms.push(new StandardRoom('102'));
        this.rooms.push(new ConferenceRoom('201'));
    }

    public static getInstance(): BookingSystem {
        if (!BookingSystem.instance) {
            BookingSystem.instance = new BookingSystem();
        }
        return BookingSystem.instance;
    }

    public getRooms(): Room[] {
        return this.rooms;
    }

    public getBookings(): Booking[] {
        return this.bookings;
    }

    public isRoomAvailable(roomId: string, startTime: Date, endTime: Date): boolean {
        // Check if the timeslot is valid
        if (startTime >= endTime) {
            throw new Error('Start time must be before end time');
        }

        // Check for overlapping bookings
        const overlappingBooking = this.bookings.find(
            (b) =>
                b.roomId === roomId &&
                ((startTime >= b.startTime && startTime < b.endTime) ||
                    (endTime > b.startTime && endTime <= b.endTime) ||
                    (startTime <= b.startTime && endTime >= b.endTime))
        );

        return !overlappingBooking;
    }

    public getAvailableRooms(startTime: Date, endTime: Date): Room[] {
        if (startTime >= endTime) return [];

        return this.rooms.filter((room) =>
            this.isRoomAvailable(room.roomNumber, startTime, endTime)
        );
    }

    public bookRoom(roomId: string, startTime: Date, endTime: Date, clientName: string): Booking {
        const roomExists = this.rooms.find((r) => r.roomNumber === roomId);
        if (!roomExists) {
            throw new Error('Room not found');
        }

        if (!this.isRoomAvailable(roomId, startTime, endTime)) {
            throw new Error('Room is not available for the requested time slot');
        }

        const newBooking: Booking = {
            id: Math.random().toString(36).substr(2, 9), // Simple generic id
            roomId,
            startTime,
            endTime,
            clientName,
        };

        this.bookings.push(newBooking);
        return newBooking;
    }
}
