import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BookingSystem } from '../models/BookingSystem';
import { config } from '../config';

const router = Router();
const system = BookingSystem.getInstance();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await system.registerUser(name, normalizedEmail, passwordHash);
    
    // Auto-login after registration
    const payload = { userId: String(user.id), role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();

    const user = system.getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = { userId: String(user.id), role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    res.json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password (MOCK)
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();

    const user = system.getUserByEmail(normalizedEmail);
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.json({ message: 'If that email exists, the password has been reset.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    system.updateUserPassword(normalizedEmail, newPasswordHash);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
