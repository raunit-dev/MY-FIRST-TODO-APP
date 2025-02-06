import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todo';
import cors from 'cors';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
dotenv.config();
 

const app = express();
const port = 3000;

const loginLimiter = rateLimit({
  windowMs:15*60*1000,
  max:100,
  message:"Too many login attempts from this IP,try again later"
})
app.use(cors());
app.use(express.json());
app.use("/auth",loginLimiter,authRoutes);
app.use("/todo",loginLimiter,todoRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, { dbName: "TODOWEBAPP" });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectToMongoDB();