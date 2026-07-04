import { useEffect, useState } from 'react'
import { todoStore } from './todoStore'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
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
    const todo = await todoStore.create(trimmed)
    setTodos((prev) => [todo, ...prev])
    setTitle('')
  }

  async function toggleTodo(todo) {
    const updated = await todoStore.update(todo.id, { completed: !todo.completed })
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function deleteTodo(id) {
    await todoStore.remove(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const remaining = todos.filter((t) => !t.completed).length

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
        <button type="submit">추가</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="empty">불러오는 중...</p>
      ) : todos.length === 0 ? (
        <p className="empty">할 일이 없습니다.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                />
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label="삭제"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="summary">남은 할 일: {remaining} / {todos.length}</p>
      )}
    </div>
  )
}

export default App
