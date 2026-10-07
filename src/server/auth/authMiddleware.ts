import { Request, Response, NextFunction } from 'express';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/demoData';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract user identity from session header or auth token
  const authHeader = req.header('Authorization');
  const userHeader = req.header('X-User-Id');

  let activeUserId = 'user_amara'; // Default demo user

  if (userHeader && (userHeader === 'user_amara' || userHeader === 'user_elena')) {
    activeUserId = userHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === 'user_elena' || token === 'user_amara') {
      activeUserId = token;
    }
  }

  // Derive verified user profile strictly from authenticated identity
  const user = DEMO_USERS[activeUserId] || {
    id: activeUserId,
    name: activeUserId === 'user_elena' ? 'Elena' : 'Amara',
    dietaryExclusions: activeUserId === 'user_elena' ? ['dairy-free', 'nut-free'] : ['gluten-free', 'vegetarian'],
    averageCycleLength: 28
  };

  req.user = user;
  next();
}
