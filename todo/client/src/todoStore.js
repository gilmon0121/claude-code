const API_BASE = 'http://localhost:4000/api/todos'
const LOCAL_KEY = 'todos'

const useLocalStorage = import.meta.env.PROD

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(todos) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(todos))
}

async function list() {
  if (useLocalStorage) return readLocal()
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error('failed to load todos')
  return res.json()
}

async function create(title) {
  if (useLocalStorage) {
    const todos = readLocal()
    const todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    writeLocal([todo, ...todos])
    return todo
  }
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  return res.json()
}

async function update(id, patch) {
  if (useLocalStorage) {
    const todos = readLocal()
    const todo = todos.find((t) => t.id === id)
    if (todo) Object.assign(todo, patch)
    writeLocal(todos)
    return todo
  }
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return res.json()
}

async function remove(id) {
  if (useLocalStorage) {
    writeLocal(readLocal().filter((t) => t.id !== id))
    return
  }
  await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const todoStore = { list, create, update, remove }
