import React, { useState } from 'react';
import { AlertCircle, Edit, Trash2, Clock, Calendar, ArrowUpDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialTasks = [
  { id: 1, text: "Crm - לקרוא את ההתכתבות עם טל כדי להבין מה המצב מבחינת הרשמה שלב ב' בcrm.", completed: false, day: "רביעי", priority: "medium" },
  { id: 2, text: "Crm - לקרוא את הקובץ מייל שצירפתי להתכתבות עם טל, מייל קבלה לשלב ב'. – לכתוב אם יש לך ההערות או שהתוכן בסדר מבחינתך.", completed: false, day: "רביעי", priority: "high" },
  { id: 3, text: "Crm - לקרוא את הקובץ מייל שטל צירף להתכתבות, מייל דחייה. – לכתוב אם יש לך הערות או שהתוכן בסדר מבחינתך.", completed: false, day: "רביעי", priority: "high" },
  { id: 4, text: "Crm - על בסיס קובץ מייל הדחייה, להכין מייל שמודיע על רשימת המתנה/ קבלה על בסיס מקום פנוי. להתבסס כמה שיותר על התוכן הקיים רק עם שינוי המסר לרשימת המתנה במקום דחייה.", completed: false, day: "חמישי", priority: "medium" },
  { id: 5, text: "לבדוק בטופס מנחים אם עידו ואוריאל כבר נרשמו.", completed: false, day: "חמישי", priority: "low" },
  { id: 6, text: "וואטסאפ – לבדוק איך לקדם את זה. במייל האחרון בנושא הפנו אותנו לכתוב למישהי שאולי תדעי לעזור. אפשר גם להתייעץ עם חגית.", completed: false, day: "חמישי", priority: "medium" },
  { id: 7, text: "חשד להעתקה- לעבור על התלמידים שחשדנו, ולחפש הצלבות. (אם אתה רוצה, לא כדאי להשקיע בזה יותר מדי זמן. גג שעה)", completed: false, day: "חמישי", priority: "low" },
  { id: 8, text: "Moodle - לדבר עם מורן – במהלך הסופש היתה בעיה במודל, ועכשיו הוא חזר. אז היא בעיקר היתה סביב זה. להבין ממנה האם היא הספיקה לעשות משהו בהקשר של התכנית.", completed: false, day: "חמישי", priority: "high" },
  { id: 9, text: "Moodle - לשאול אותה אם אנחנו יכולים להוסיף פגישות יוניקו כמו של כימיה ברשת.", completed: false, day: "חמישי", priority: "medium" },
  { id: 10, text: "Moodle - אם מורן כבר פתחה אתר חדש לשלב ב', להתחיל להטמיע את הדברים שאפיינת שבוע שעבר.", completed: false, day: "חמישי", priority: "high" },
];

const App = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [hoursWorked, setHoursWorked] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedDay, setSelectedDay] = useState('רביעי');
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [sortBy, setSortBy] = useState('id');

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const completedTasks = tasks.filter(task => task.completed);
    console.log('משימות שהושלמו:', completedTasks);
    console.log('שעות עבודה:', hoursWorked);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      setTasks([...tasks, { 
        id: tasks.length + 1, 
        text: newTaskText, 
        completed: false, 
        day: selectedDay,
        priority: newTaskPriority
      }]);
      setNewTaskText('');
      setNewTaskPriority('medium');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setNewTaskText(task.text);
    setNewTaskPriority(task.priority);
  };

  const saveEdit = () => {
    if (newTaskText.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, text: newTaskText, priority: newTaskPriority } : task
      ));
      setEditingTask(null);
      setNewTaskText('');
      setNewTaskPriority('medium');
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
        {sortTasks(tasks.filter(task => task.day === selectedDay))
          .map(task => (
          <div key={task.id} className="flex items-center bg-white p-4 rounded-lg shadow">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
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
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
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
          <AlertTitle>הצלחה!</AlertTitle>
          <AlertDescription>
            הנתונים נשלחו בהצלחה. תודה על עבודתך היום!
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

export default AppLocal;