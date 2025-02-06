import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import authenticateJwt from '../middleware';
import  {User}  from '../db'
import { credentials} from '@raunit/common';
import * as dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt"
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
      const hashPassword = bcrypt.hash(password,10);
      const newUser = new User({ username, password: hashPassword });
      await newUser.save();
      jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' }, (err, accessToken) => {
        if (err) {
          return res.status(500).json({ message: 'accessError generating token' });
        }
        jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' }, (err, refreshToken) => {
          if (err) {
            return res.status(500).json({ message: 'Error generating refreshtoken' });
          }
        res.json({ message: 'User created successfully', refreshToken,accessToken });
      })});
    }
  });
  router.post("/login", async (req: Request, res: Response): Promise<void> => {
      const result = credentials.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: result.error });
        return;
      }
      const { username, password } = result.data;
      const newUser = await User.findOne({ username });
      if (!newUser) {
        res.status(403).json({ message: "Invalid username or password" });
        return;
      }
      const isMatch = await bcrypt.compare(password, newUser.password);
      if (!isMatch) {
        res.status(403).json({ message: "Invalid username or password" });
        return;
      }
      jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' }, (err, accessToken) => {
        if (err) {
          return res.status(500).json({ message: 'Error generating access token' });
        }
        jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '7d' }, (err, refreshToken) => {
          if (err) {
            return res.status(500).json({ message: 'Error generating refresh token' });
          }
        res.json({ message: 'User created successfully', refreshToken,accessToken });
      })
    });
    }
  );
  router.post('/refresh-token',(req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token missing' });
    }

    jwt.verify(refreshToken,SECRET, (err:any, decoded:any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        const newAccessToken = jwt.sign({ id: decoded.id }, SECRET, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: decoded.id }, SECRET, { expiresIn: '7d' });
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
});

 export default router