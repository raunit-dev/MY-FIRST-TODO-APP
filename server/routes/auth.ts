import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import authenticateJwt from '../middleware';
import  {User}  from '../db'
import * as dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.SECRET || 'defaultSecret';
const router = express.Router();
 /// should i add a credentials for user info to ?
 

  router.post('/signup', async (req:Request, res:Response) :Promise<void>=> {
    const { username, password } = req.body;
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
    const { username, password } = req.body;
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