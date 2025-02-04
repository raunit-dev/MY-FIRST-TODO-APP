import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import authenticateJwt from '../middleware';
import  {User}  from '../db'
import * as dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.SECRET || 'defaultSecret';
const router = express.Router();
 /// should i add a credentials for user info to ?
 import {z} from "zod";
 const weakPasswords = [
  "password",
  "12345678",
  "qerty123",
  "letmein",
  "12345678",
 ];
 const credentials = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Username must start with a letter or underscore and can only contain letters, numbers, and underscores"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password cannot exceed 20 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
    .refine((val)=> !weakPasswords.includes(val.toLowerCase()),
    { message: "This password is too common, please choose a stronger one." })
 }
);
 

  router.post('/signup', async (req:Request, res:Response) :Promise<void>=> {
    const result = credentials.safeParse(req.body)
    if(!result.success)
    {
       res.json({ message: result.error});
       return;
    }
    const { username, password } = result.data;
    const user = await User.findOne({ username });
    if (user) {
      res.status(403).json({ message: 'User already exists' });
    } else {
      const newUser = new User({ username, password });
      await newUser.save();
      jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({ message: 'User created successfully', token });
      });
    }
  });
  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const result = credentials.safeParse(req.body)
    if(!result.success)
    {
       res.json({ message: result.error});
       return;
    }
    const { username, password } = result.data;
    const user = await User.findOne({ username, password });
    
    if (user) {
      jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({ message: 'Logged in successfully', token });
      });
    } else {
      res.status(403).json({ message: 'Invalid username or password' });
    }
  });
  

  router.get('/me',authenticateJwt,async (req: Request, res: Response) :Promise<void> => {
    try {
      // Ensure your JWT middleware sets `req.headers["user-id"]`
      const userId = req.headers["user-id"];
      const user = await User.findOne({ _id: userId });
      if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
      }
      res.json({ username: user.username }); // ✅ Correct response
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

 export default router