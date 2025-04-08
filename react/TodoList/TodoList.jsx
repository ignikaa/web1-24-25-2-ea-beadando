import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import './TodoList.css';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Betöltjük a tárolt feladatokat
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Mentjük a feladatokat a localStorage-ba
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      setTasks([...tasks, newTask]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleEditTask = (id, newText) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: newText } : task
    ));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Szűrt feladatok a kiválasztott filter alapján
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all' esetén
  });

  // Aktív és befejezett feladatok számolása
  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="todo-container">
      <h2>Todo Lista</h2>
      
      <div className="todo-app">
        <div className="add-task">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Új feladat hozzáadása..."
            className="task-input"
          />
          <button onClick={handleAddTask} className="add-button">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Összes
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Aktív
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Befejezett
          </button>
          {completedCount > 0 && (
            <button 
              className="clear-completed" 
              onClick={clearCompleted}
            >
              Befejezettek törlése
            </button>
          )}
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="empty-list">
            <p>{filter === 'all' ? 'Nincsenek feladatok. Adj hozzá újat!' : 
               filter === 'active' ? 'Nincsenek aktív feladatok.' : 
               'Nincsenek befejezett feladatok.'}</p>
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map(task => (
              <TodoItem 
                key={task.id} 
                task={task} 
                onToggle={handleToggleComplete} 
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            ))}
          </ul>
        )}
        
        <div className="task-stats">
          <span>Összes: {tasks.length}</span>
          <span>Aktív: {activeCount}</span>
          <span>Befejezett: {completedCount}</span>
        </div>
      </div>
    </div>
  );
}

// TodoItem komponens
function TodoItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim() !== '') {
      onEdit(task.id, editText);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(task.text);
    }
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            autoFocus
          />
        </div>
      ) : (
        <>
          <div className="task-content">
            <button 
              className={`checkbox ${task.completed ? 'checked' : ''}`}
              onClick={() => onToggle(task.id)}
            >
              {task.completed && <FontAwesomeIcon icon={faCheck} />}
            </button>
            <span 
              className="task-text"
              onClick={() => onToggle(task.id)}
            >
              {task.text}
            </span>
          </div>
          <div className="task-actions">
            <button className="edit-btn" onClick={handleEdit}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button className="delete-btn" onClick={() => onDelete(task.id)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TodoList;
