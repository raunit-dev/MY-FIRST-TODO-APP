import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();


const SECRET = process.env.SECRET || 'defaultSecret';

const authenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        console.log("JWT Verification Error:", err.message);  // Log the specific error message
        return res.sendStatus(403);
      }
      if (!decoded) {
        console.log("JWT Decoded data is null");  // Log when decoded is null
        return res.sendStatus(403);
      }
      if (typeof decoded === "string") {
        console.log("JWT Decoded data is a string (unexpected)");  // Log when decoded is a string
        return res.sendStatus(403);
      }
      console.log("Decoded JWT:", decoded);
      req.headers['user-id'] = (decoded as { id: string }).id;
      next();
    });
    ;
  } else {
    res.sendStatus(401);
  }
};

export default authenticateJwt;