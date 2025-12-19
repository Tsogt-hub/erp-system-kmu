import { Request, Response } from 'express';
import * as TaskModel from '../models/Task';

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const tasks = await TaskModel.getAllTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.getTaskById(parseInt(id));
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { title, description, status, priority, due_date, assigned_to, project_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const task = await TaskModel.createTask({
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
      project_id,
      created_by: userId,
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to, project_id } = req.body;
    
    const task = await TaskModel.updateTask(parseInt(id), {
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
      project_id,
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await TaskModel.deleteTask(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};






