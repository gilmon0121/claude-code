import { useEffect, useState } from 'react'
import { todoStore } from './todoStore'
import './App.css'

const PRIORITY_LABEL = { low: '낮음', medium: '보통', high: '높음' }
const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행중' },
  { key: 'completed', label: '완료' },
]

function dueInfo(dueDate, completed) {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diffDays = Math.round((due - today) / 86400000)
  let label
  if (diffDays === 0) label = 'D-DAY'
  else if (diffDays > 0) label = `D-${diffDays}`
  else label = `D+${Math.abs(diffDays)}`
  return { label, overdue: !completed && diffDays < 0 }
}

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      setLoading(true)
      setTodos(await todoStore.list())
      setError('')
    } catch (err) {
      setError('할 일을 불러오지 못했습니다. 서버가 실행 중인지 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  async function addTodo(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const todo = await todoStore.create({ title: trimmed, dueDate: dueDate || null, priority })
    setTodos((prev) => [todo, ...prev])
    setTitle('')
    setDueDate('')
    setPriority('medium')
  }

  async function toggleTodo(todo) {
    const updated = await todoStore.update(todo.id, { completed: !todo.completed })
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function deleteTodo(id) {
    await todoStore.remove(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function startEdit(todo) {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
  }

  async function submitEdit(e, id) {
    e.preventDefault()
    const trimmed = editingTitle.trim()
    setEditingId(null)
    if (!trimmed) return
    const updated = await todoStore.update(id, { title: trimmed })
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length
  const progress = todos.length === 0 ? 0 : Math.round(((todos.length - remaining) / todos.length) * 100)

  return (
    <div className="app">
      <h1>TODO</h1>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
        />
        <input
          type="date"
          className="date-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </select>
        <button type="submit">추가</button>
      </form>

      {error && <p className="error">{error}</p>}

      {todos.length > 0 && (
        <div className="progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      )}

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filter === f.key ? 'active' : ''}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty">불러오는 중...</p>
      ) : filteredTodos.length === 0 ? (
        <p className="empty">할 일이 없습니다.</p>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => {
            const due = dueInfo(todo.dueDate, todo.completed)
            return (
              <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  {editingId === todo.id ? (
                    <form className="edit-form" onSubmit={(e) => submitEdit(e, todo.id)}>
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={(e) => submitEdit(e, todo.id)}
                      />
                    </form>
                  ) : (
                    <span onDoubleClick={() => startEdit(todo)}>{todo.title}</span>
                  )}
                </label>
                <div className="tags">
                  {due && (
                    <span className={`badge due ${due.overdue ? 'overdue' : ''}`}>{due.label}</span>
                  )}
                  <span className={`badge priority-${todo.priority}`}>
                    {PRIORITY_LABEL[todo.priority] || '보통'}
                  </span>
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="삭제"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="summary">남은 할 일: {remaining} / {todos.length}</p>
      )}
    </div>
  )
}

export default App
