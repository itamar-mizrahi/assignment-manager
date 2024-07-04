import React, { useState, useEffect } from 'react';
import { AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import './App.css';


const API_URL = 'http://localhost:5000/api'; // Replace with your actual API URL

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [hoursWorked, setHoursWorked] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedDay, setSelectedDay] = useState('רביעי');
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [sortBy, setSortBy] = useState('id');

  useEffect(() => {
    fetchTasks();
  }, [selectedDay]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks?day=${selectedDay}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showAlertMessage('שגיאה בטעינת המשימות');
    }
  };

  const toggleTask = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT', // שינוי מ-PATCH ל-PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !task.completed,
          text: task.text,
          priority: task.priority
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      await fetchTasks();
      showAlertMessage('המשימה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error toggling task:', error);
      showAlertMessage('שגיאה בעדכון המשימה');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/workday`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursWorked, day: selectedDay })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      showAlertMessage(data.message);
      
      // Add this part to display download link
      if (data.excelFilePath) {
        const downloadLink = document.createElement('a');
        downloadLink.href = data.excelFilePath;
        downloadLink.download = 'progress_report.xlsx';
        downloadLink.innerHTML = 'הורד דו"ח אקסל';
        downloadLink.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4';
        
        const container = document.querySelector('form');
        if (container) {
          container.appendChild(downloadLink);
        }
      }
    } catch (error) {
      console.error('Error submitting workday:', error);
      showAlertMessage('שגיאה בשליחת נתוני יום העבודה');
    }
  };
  const addTask = async () => {
    if (newTaskText.trim()) {
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newTaskText,
            completed: false,
            day: selectedDay,
            priority: newTaskPriority
          })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchTasks();
        setNewTaskText('');
        setNewTaskPriority('medium');
        showAlertMessage('המשימה נוספה בהצלחה');
      } catch (error) {
        console.error('Error adding task:', error);
        showAlertMessage('שגיאה בהוספת המשימה');
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      console.log('deleteTask', id);
      const response = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Network response was not ok');
      await fetchTasks();
      showAlertMessage('המשימה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting task:', error);
      showAlertMessage('שגיאה במחיקת המשימה');
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setNewTaskText(task.text);
    setNewTaskPriority(task.priority);
  };

  const saveEdit = async () => {
    if (newTaskText.trim() && editingTask) {
      try {
        const response = await fetch(`${API_URL}/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newTaskText,
            priority: newTaskPriority
          })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchTasks();
        setEditingTask(null);
        setNewTaskText('');
        setNewTaskPriority('medium');
        showAlertMessage('המשימה עודכנה בהצלחה');
      } catch (error) {
        console.error('Error editing task:', error);
        showAlertMessage('שגיאה בעדכון המשימה');
      }
    }
  };

  const sortTasks = (tasksToSort) => {
    return tasksToSort.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.id - b.id;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">ניהול משימות</h1>

      <div className="mb-4 flex justify-center space-x-4">
        <Button
          onClick={() => setSelectedDay('רביעי')}
          variant={selectedDay === 'רביעי' ? 'default' : 'outline'}
        >
          רביעי
        </Button>
        <Button
          onClick={() => setSelectedDay('חמישי')}
          variant={selectedDay === 'חמישי' ? 'default' : 'outline'}
        >
          חמישי
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="מיין לפי" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">סדר מקורי</SelectItem>
            <SelectItem value="priority">עדיפות</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {sortTasks(tasks).map(task => (
          <div key={task.id} className="flex items-center bg-white p-4 rounded-lg shadow">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task._id)}
              className="mr-4 h-5 w-5 text-blue-600"
            />
            <div className="flex-grow">
              <label className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.text}
              </label>
              <div className={`text-sm ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => startEditing(task)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">הוסף משימה חדשה</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף משימה חדשה</DialogTitle>
            </DialogHeader>
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="הזן משימה חדשה"
            />
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">גבוהה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="low">נמוכה</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTask}>הוסף</Button>
          </DialogContent>
        </Dialog>

        <div className="mt-6">
          <label htmlFor="hoursWorked" className="block text-sm font-medium text-gray-700">
            שעות עבודה:
          </label>
          <Input
            type="number"
            id="hoursWorked"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            placeholder="הזן מספר שעות"
          />
        </div>
        <Button type="submit" className="w-full">
          סיום יום עבודה
        </Button>
      </form>

      {showAlert && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>הודעה</AlertTitle>
          <AlertDescription>
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ערוך משימה</DialogTitle>
            </DialogHeader>
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="ערוך משימה"
            />
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">גבוהה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="low">נמוכה</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={saveEdit}>שמור</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default App;