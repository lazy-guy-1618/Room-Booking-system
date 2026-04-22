import { Router, Response } from 'express';
import { BookingSystem } from '../models/BookingSystem';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const system = BookingSystem.getInstance();

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res: Response) => {
  // Map out sensitive info like passwordHash
  const users = system.getAllUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json({ users });
});

// GET /api/admin/bookings
router.get('/bookings', (req: AuthRequest, res: Response) => {
  res.json({ bookings: system.getBookings() });
});

// DELETE /api/admin/bookings/:id
router.delete('/bookings/:id', (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // We pass isAdmin = true
    const success = system.cancelBooking(id, 'admin_override', true);
    
    if (success) {
      res.json({ message: 'Booking cancelled by admin successfully' });
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
