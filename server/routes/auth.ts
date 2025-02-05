import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import authenticateJwt from '../middleware';
import  {User}  from '../db'
import { credentials} from '@raunit/common';
import * as dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.SECRET || 'defaultSecret';
const router = express.Router();

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
    //no need to add the zod lib here cause its login but still added to practise more and more 
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