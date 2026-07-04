import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');
const PORT = 4000;

const app = express();
app.use(cors());
app.use(express.json());

async function readTodos() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeTodos(todos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

app.get('/api/todos', async (req, res) => {
  const todos = await readTodos();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const todos = await readTodos();
  const todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(todo);
  await writeTodos(todos);
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const todos = await readTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'not found' });
  }
  if (typeof req.body.completed === 'boolean') {
    todo.completed = req.body.completed;
  }
  if (typeof req.body.title === 'string' && req.body.title.trim()) {
    todo.title = req.body.title.trim();
  }
  await writeTodos(todos);
  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const todos = await readTodos();
  const next = todos.filter((t) => t.id !== id);
  if (next.length === todos.length) {
    return res.status(404).json({ error: 'not found' });
  }
  await writeTodos(next);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Todo API server running at http://localhost:${PORT}`);
});
