const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5045;

app.use(cors());
app.use(bodyParser.json());

let tasks = [];
let currentId = 1;

app.get("/", (req, res) => {
    res.send("Welcome to the To-Do List API");
  });

// GET /tasks - Fetch all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// POST /tasks - Add a new task
app.post("/tasks", (req, res) => {
  const { title, completed } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const newTask = {
    id: currentId++,
    title,
    completed: completed || false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update a task
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const task = tasks.find((task) => task.id === parseInt(id));
  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  task.completed = completed;
  res.json(task);
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex((task) => task.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
