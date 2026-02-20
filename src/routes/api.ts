import { Router, Request, Response } from 'express';
import { BookingSystem } from '../models/BookingSystem';

const router = Router();
const bookingSystem = BookingSystem.getInstance();

// GET /api/availability?startTime=...&endTime=...
router.get('/availability', (req: Request, res: Response) => {
    try {
        const { startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return res.status(400).json({ error: 'startTime and endTime are required' });
        }

        const start = new Date(startTime as string);
        const end = new Date(endTime as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const availableRooms = bookingSystem.getAvailableRooms(start, end);
        res.json({ availableRooms });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/book
router.post('/book', (req: Request, res: Response) => {
    try {
        const { roomId, startTime, endTime, clientName } = req.body;

        if (!roomId || !startTime || !endTime || !clientName) {
            return res.status(400).json({ error: 'roomId, startTime, endTime, and clientName are required' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const booking = bookingSystem.bookRoom(roomId, start, end, clientName);
        res.status(201).json({ message: 'Room booked successfully', booking });
    } catch (error: any) {
        if (error.message === 'Room not found' || error.message === 'Room is not available for the requested time slot') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// GET /api/rooms - Helper to fetch all rooms
router.get('/rooms', (req: Request, res: Response) => {
    res.json({ rooms: bookingSystem.getRooms() });
});

export default router;
