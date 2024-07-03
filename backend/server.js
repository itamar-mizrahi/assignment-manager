const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Model
const taskSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  day: String,
  priority: String
});

const Task = mongoose.model('Task', taskSchema);

// Routes

// Get tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { day } = req.query;
    const tasks = await Task.find({ day });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Add task
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error adding task', error: error.message });
  }
});

// Update task
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting task', error: error.message });
  }
});

// Workday submission
app.post('/api/workday', async (req, res) => {
  try {
    // Here you would typically save the workday data to a separate collection
    // For simplicity, we'll just log it and send a success response
    console.log('Workday submitted:', req.body);
    res.json({ message: 'Workday submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting workday', error: error.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));