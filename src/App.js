import React, { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"
import { PlusCircle, CheckCircle, Circle, Trash2, List, CheckSquare, Square, Loader } from "lucide-react"

export default function TodoApp() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState("")
  const [taskCounts, setTaskCounts] = useState({ all: 0, completed: 0, pending: 0 })

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    calculateTaskCounts(tasks)
  }, [tasks])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:5045/tasks")
      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching tasks", error)
      setWarning("Failed to fetch tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const calculateTaskCounts = (tasks) => {
    const completed = tasks.filter((task) => task.completed).length
    const pending = tasks.length - completed
    setTaskCounts({
      all: tasks.length,
      completed,
      pending,
    })
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) {
      setWarning("Task cannot be empty!")
      setTimeout(() => setWarning(""), 3000)
      return
    }
    setWarning("")
    try {
      const response = await axios.post("http://localhost:5045/tasks", {
        title: newTask,
        completed: false,
      })
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks, response.data]
        calculateTaskCounts(newTasks)
        return newTasks
      })
      setNewTask("")
    } catch (error) {
      console.error("Error adding task", error)
      setWarning("Failed to add task. Please try again.")
    }
  }

  const updateTask = async (id, completed) => {
    try {
      await axios.put(`http://localhost:5045/tasks/${id}`, { completed })
      setTasks((prevTasks) => {
        const newTasks = prevTasks.map((task) => (task.id === id ? { ...task, completed } : task))
        calculateTaskCounts(newTasks)
        return newTasks
      })
    } catch (error) {
      console.error("Error updating task", error)
      setWarning("Failed to update task. Please try again.")
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5045/tasks/${id}`)
      setTasks((prevTasks) => {
        const newTasks = prevTasks.filter((task) => task.id !== id)
        calculateTaskCounts(newTasks)
        return newTasks
      })
    } catch (error) {
      console.error("Error deleting task", error)
      setWarning("Failed to delete task. Please try again.")
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  return (
    <div className="todo-app">
      <h1>
        <List size={24} className="icon" /> TASKS
      </h1>
      <h4>
        A to-do list management application made by{" "}
        <a href="https://www.linkedin.com/in/krishna-moni-das-2ab322210/" target="_blank" rel="noopener noreferrer">
          Krishna Moni Das
        </a>
      </h4>

      <form onSubmit={addTask} className="input-group">
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task" />
        <button type="submit" className="add-button">
          <PlusCircle size={20} className="icon" /> Add
        </button>
      </form>

      {warning && <div className="warning">{warning}</div>}

      <div className="filter-buttons">
        {[
          { type: "all", icon: <List size={20} className="icon" /> },
          { type: "completed", icon: <CheckSquare size={20} className="icon" /> },
          { type: "pending", icon: <Square size={20} className="icon" /> },
        ].map(({ type, icon }) => (
          <button
            key={type}
            className={`filter-button ${filter === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
          >
            {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
            <span className="task-count">{taskCounts[type]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">
          <Loader size={24} className="icon spinning" />
          <span>Loading tasks...</span>
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task.id} className={`task-item ${task.completed ? "task-completed" : ""}`}>
              <div className="task-content">
                <button onClick={() => updateTask(task.id, !task.completed)} className="checkbox-button">
                  {task.completed ? (
                    <CheckCircle size={20} className="icon completed" />
                  ) : (
                    <Circle size={20} className="icon" />
                  )}
                </button>
                <span className="task-title">{task.title}</span>
              </div>
              <button onClick={() => deleteTask(task.id)} className="delete-button">
                <Trash2 size={20} className="icon" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

