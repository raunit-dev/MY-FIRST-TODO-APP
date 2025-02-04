import express from 'express'
import authenticateJwt from '../middleware/index'
import { Todo } from '../db'
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response} from 'express';
const router = express.Router();
import { z } from "zod"

const todoValidation = z.object({
  title:z.string()
    .min(3, "title must be at least 3 characters long")
    .max(20, "title cannot exceed 20 characters"),
  description: z.string().min(3, "description must be at least 3 characters long"),
})

router.post('/todos', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  const result=todoValidation.safeParse(req.body);
  if(!result.success)
  {
    res.json({message: result.error});
    return;
  }
  try {
    const inputs= result.data;
    const done = false;
    const userId = req.headers['user-id'];

    if (!userId) {
      res.status(400).json({ error: 'User ID is missing in headers' });
      return ;
    }

    const newTodo = new Todo({ title: inputs.title, description: inputs.description, done, userId });
    await newTodo.save();

    res.status(201).json(newTodo); 
  } catch (err) { 
    res.status(500).json({ error: 'Failed to create a new todo' });
  }  
});



router.get('/todos', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['user-id'];
    const todos = await Todo.find({ userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve todos' });
  }
  
});

router.patch('/todos/:todoId/done', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const { todoId } = req.params;
    const userId = req.headers['user-id'];
  
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, userId },
      { done: true },
      { new: true }
    );
  
    if (!updatedTodo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
  
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
  
});

export default router;