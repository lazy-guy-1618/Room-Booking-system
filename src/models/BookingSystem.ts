import { Room, StandardRoom, ConferenceRoom } from './Room';
import { User, Role } from './User';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface Booking {
    id: string;
    roomId: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    userId?: string;  // Add userId to track who made the booking
}

export class BookingSystem {
    private static instance: BookingSystem;
    private rooms: Room[] = [];
    private bookings: Booking[] = [];
    private users: User[] = [];

    private constructor() {
        // Initialization logic moved to initializeDefaults()
    }

    public static getInstance(): BookingSystem {
        if (!BookingSystem.instance) {
            BookingSystem.instance = new BookingSystem();
            // We need to ensure initializeDefaults is called, but it's async.
            // For a singleton, this might be handled by an async factory method or
            // by ensuring the first call awaits it. For simplicity here, we'll
            // assume it's handled externally or that the async nature is acceptable.
            // A more robust solution might involve an async `getInstance` or a separate `init` method.
            BookingSystem.instance.initializeDefaults();
        }
        return BookingSystem.instance;
    }

    private async initializeDefaults() {
        // Initialize with some dummy rooms
        this.rooms.push(new StandardRoom('101'));
        this.rooms.push(new StandardRoom('102'));
        this.rooms.push(new ConferenceRoom('201'));

        // Seed an admin user
        const salt = await bcrypt.genSalt(10);
        const adminPasswordHash = await bcrypt.hash('admin123', salt);
        this.users.push({
            id: 'admin_123',
            name: 'System Admin',
            email: 'admin@spacesync.com',
            passwordHash: adminPasswordHash,
            role: Role.ADMIN
        });
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

    public bookRoom(roomId: string, startTime: Date, endTime: Date, clientName: string, userId?: string): Booking {
        if (startTime >= endTime) {
            throw new Error('Start time must be before end time');
        }

        if (startTime < new Date()) {
            throw new Error('Cannot book a room in the past');
        }

        const roomExists = this.rooms.find((r) => r.roomNumber === roomId);
        if (!roomExists) {
            throw new Error('Room not found');
        }

        if (!this.isRoomAvailable(roomId, startTime, endTime)) {
            throw new Error('Room is not available for the requested time slot');
        }

        const newBooking: Booking = {
            id: uuidv4(),
            roomId,
            startTime,
            endTime,
            clientName,
            userId, // Assign userId to the booking
        };

        this.bookings.push(newBooking);
        return newBooking;
    }

    // --- User Management Methods ---

    public async registerUser(name: string, email: string, passwordHash: string): Promise<User> {
        const normalizedEmail = email.toLowerCase().trim();
        
        if (this.users.find(u => u.email === normalizedEmail)) {
            throw new Error('User already exists');
        }

        const newUser: User = {
            id: uuidv4(),
            name,
            email: normalizedEmail,
            passwordHash,
            role: Role.USER
        };

        this.users.push(newUser);
        return newUser;
    }

    public getUserByEmail(email: string): User | undefined {
        const normalizedEmail = email.toLowerCase().trim();
        return this.users.find(u => u.email === normalizedEmail);
    }

    public getAllUsers(): User[] {
        return this.users;
    }

    public updateUserPassword(email: string, newPasswordHash: string): boolean {
        const normalizedEmail = email.toLowerCase().trim();
        const user = this.getUserByEmail(normalizedEmail);
        if (!user) return false;
        user.passwordHash = newPasswordHash;
        return true;
    }

    public cancelBooking(bookingId: string, userId: string, isAdmin: boolean = false): boolean {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return false;

        // Proceed if the user is an admin OR if the booking belongs to this user
        if (isAdmin || this.bookings[index].userId === userId) {
            this.bookings.splice(index, 1);
            return true;
        }

        throw new Error('Unauthorized to cancel this booking');
    }
}
