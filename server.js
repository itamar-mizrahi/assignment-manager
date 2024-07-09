const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/exports', express.static('exports')); // S
// app.use('/test', express.static('test')); // S
app.use('/assets', express.static('assets')); // S
app.use('/', express.static('dist')); // S

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Model
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  day: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
});

const Task = mongoose.model('Task', taskSchema);

// Routes

// Get tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { day } = req.query;
    if (!day) {
      return res.status(400).json({ message: 'Day parameter is required' });
    }
    const tasks = await Task.find({ day });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Add task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text, day, priority } = req.body;
    if (!text || !day) {
      return res.status(400).json({ message: 'Text and day are required fields' });
    }
    const newTask = new Task({ text, day, priority });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error adding task', error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, priority } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { text, completed, priority },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', taskId: id });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting task', error: error.message });
  }
});

// // Workday submission
// app.post('/api/workday', async (req, res) => {
//   try {
//     const { hoursWorked, day } = req.body;
//     if (!hoursWorked || !day) {
//       return res.status(400).json({ message: 'Hours worked and day are required fields' });
//     }
//     console.log('Workday submitted:', { hoursWorked, day });
//     res.json({ message: 'Workday submitted successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Error submitting workday', error: error.message });
//   }
// });

app.post('/api/workday', async (req, res) => {
  try {
    const { hoursWorked, day } = req.body;
    if (!hoursWorked || !day) {
      return res.status(400).json({ message: 'Hours worked and day are required fields' });
    }

    // Fetch tasks for the day
    const tasks = await Task.find({ day });

    // Generate progress report
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;

    // Create Excel file
    const excelFilePath = await createExcelReport(day, hoursWorked, tasks, completedTasks, totalTasks);

    console.log('Workday submitted:', { hoursWorked, day });
    res.json({ 
      message: 'Workday submitted successfully and Excel file created',
      excelFilePath: excelFilePath.replace('exports', '/exports') // Convert to URL path
    });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting workday', error: error.message });
  }
});

// Function to create Excel report
async function createExcelReport(day, hoursWorked, tasks, completedTasks, totalTasks) {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['יום עבודה', day],
    ['שעות עבודה', hoursWorked],
    ['משימות שהושלמו', `${completedTasks}/${totalTasks}`]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'סיכום');

  // Tasks sheet
  const tasksData = tasks.map(task => [
    task.text,
    task.completed ? 'הושלם' : 'לא הושלם',
    task.priority
  ]);
  tasksData.unshift(['משימה', 'סטטוס', 'עדיפות']); // Add header row
  const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(workbook, tasksSheet, 'משימות');

  // Ensure exports directory exists
  const exportsDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(exportsDir)){
    fs.mkdirSync(exportsDir);
  }

  // Generate unique filename
  const fileName = `progress_report_${day}_${Date.now()}.xlsx`;
  const filePath = path.join(exportsDir, fileName);
  console.log(fileName);
  // Write to file
  XLSX.writeFile(workbook, filePath);

  return fileName;
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// const initialTasks = [
//   { id: 1, text: "Crm - לקרוא את ההתכתבות עם טל כדי להבין מה המצב מבחינת הרשמה שלב ב' בcrm.", completed: false, day: "רביעי", priority: "medium" },
//   { id: 2, text: "Crm - לקרוא את הקובץ מייל שצירפתי להתכתבות עם טל, מייל קבלה לשלב ב'. – לכתוב אם יש לך ההערות או שהתוכן בסדר מבחינתך.", completed: false, day: "רביעי", priority: "high" },
//   { id: 3, text: "Crm - לקרוא את הקובץ מייל שטל צירף להתכתבות, מייל דחייה. – לכתוב אם יש לך הערות או שהתוכן בסדר מבחינתך.", completed: false, day: "רביעי", priority: "high" },
//   { id: 4, text: "Crm - על בסיס קובץ מייל הדחייה, להכין מייל שמודיע על רשימת המתנה/ קבלה על בסיס מקום פנוי. להתבסס כמה שיותר על התוכן הקיים רק עם שינוי המסר לרשימת המתנה במקום דחייה.", completed: false, day: "חמישי", priority: "medium" },
//   { id: 5, text: "לבדוק בטופס מנחים אם עידו ואוריאל כבר נרשמו.", completed: false, day: "חמישי", priority: "low" },
//   { id: 6, text: "וואטסאפ – לבדוק איך לקדם את זה. במייל האחרון בנושא הפנו אותנו לכתוב למישהי שאולי תדעי לעזור. אפשר גם להתייעץ עם חגית.", completed: false, day: "חמישי", priority: "medium" },
//   { id: 7, text: "חשד להעתקה- לעבור על התלמידים שחשדנו, ולחפש הצלבות. (אם אתה רוצה, לא כדאי להשקיע בזה יותר מדי זמן. גג שעה)", completed: false, day: "חמישי", priority: "low" },
//   { id: 8, text: "Moodle - לדבר עם מורן – במהלך הסופש היתה בעיה במודל, ועכשיו הוא חזר. אז היא בעיקר היתה סביב זה. להבין ממנה האם היא הספיקה לעשות משהו בהקשר של התכנית.", completed: false, day: "חמישי", priority: "high" },
//   { id: 9, text: "Moodle - לשאול אותה אם אנחנו יכולים להוסיף פגישות יוניקו כמו של כימיה ברשת.", completed: false, day: "חמישי", priority: "medium" },
//   { id: 10, text: "Moodle - אם מורן כבר פתחה אתר חדש לשלב ב', להתחיל להטמיע את הדברים שאפיינת שבוע שעבר.", completed: false, day: "חמישי", priority: "high" },
// ];

// initialTasks.forEach(async (task) => {
//   try {
//     const newTask = new Task(task);
//     await newTask.save();
//   } catch (error) {
//     console.error('Error saving task:', error.message);
//   }
// });
