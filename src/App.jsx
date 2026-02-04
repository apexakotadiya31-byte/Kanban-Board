import { DragDropContext } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import initialData from './Data/initialData';
import Column from './components/Kanban/Column';
import './App.css';
import { useState, useEffect } from 'react';


const App = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('kanban-data');
    return savedData ? JSON.parse(savedData) : initialData;
  });

  const [newTaskContent, setNewTaskContent] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(null); 

  useEffect(() => {
    localStorage.setItem('kanban-data', JSON.stringify(data));
  }, [data]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      setData(newState);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };

    setData(newState);
  };

  const handleAddTask = (columnId) => {
    if (!newTaskContent.trim()) return;

    const newTaskId = `task-${uuidv4()}`;
    const newTask = { id: newTaskId, content: newTaskContent };

    const column = data.columns[columnId];
    const newTaskIds = [...column.taskIds, newTaskId];

    const newState = {
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    };

    setData(newState);
    setNewTaskContent('');
    setIsAddingTask(null);
  };

  // const resetBoard = () => {
  //   setData(initialData);
  //   localStorage.removeItem('kanban-data');
  // };

  const clearBoard = () => {
  const clearedColumns = {};

  Object.keys(data.columns).forEach((columnId) => {
    clearedColumns[columnId] = {
      ...data.columns[columnId],
      taskIds: [],
    };
  });

  setData({
    ...data,
    tasks: {},      
    columns: clearedColumns,
  });

  // localStorage.removeItem('kanban-data');
};


  return (
    <div className="app-container">
      <header className="app-header">
      <h1>Kanban Board</h1>

  <div style={{ display: 'flex', gap: '10px' }}>
    {/* <button onClick={resetBoard} className="reset-btn">
      Reset Board
    </button>  */}

    <button onClick={clearBoard} className="reset-btn">
      Clear Board
    </button>
  </div>
</header>

      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-container">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <div key={column.id} className="column-wrapper">
                <Column column={column} tasks={tasks} />
                
                <div className="add-task-container">
                  {isAddingTask === column.id ? (
                    <div className="add-task-form">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Enter task..."
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTask(column.id);
                          if (e.key === 'Escape') setIsAddingTask(null);
                        }}
                      />
                      <div className="add-task-actions">
                        <button onClick={() => handleAddTask(column.id)}>Add</button>
                        <button onClick={() => setIsAddingTask(null)} className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="add-task-btn"
                      onClick={() => {
                        setIsAddingTask(column.id);
                        setNewTaskContent('');
                      }}
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;
