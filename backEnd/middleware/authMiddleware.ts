import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthTokenPayload extends JwtPayload {
    id: string;
    name?: string;
    email?: string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            message: 'Access denied. No token provided.'
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;

        (req as any).user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email
        };

        next();
    } catch {
        res.status(401).json({
            message: 'Invalid or expired token.'
        });
    }
};

export default authMiddleware;
