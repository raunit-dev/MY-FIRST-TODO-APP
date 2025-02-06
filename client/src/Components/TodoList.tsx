import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Todo {
  _id: string;
  title: string;
  description: string;
  done: boolean;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string; 
}

interface UseTodoReturn {
  todos: Todo[];
  addTodo: (title: string, description: string) => void;
  markDone: (id: string) => void;
}

function useTodo(): UseTodoReturn {
    const [todos, setTodos] = useState<Todo[]>([]);
    const navigate = useNavigate();


    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            const response = await fetch('http://localhost:3000/auth/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data: RefreshTokenResponse = await response.json();
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                getTodos();
            } else {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            }
        } else {
            alert('No refresh token found.');
            navigate('/login');
        }
    };


    const getTodos = async () => {
        const response = await fetch('http://localhost:3000/todo/todos', {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });

        if (response.status === 401) {
            refreshAccessToken(); 
        } else {
            const data: Todo[] = await response.json();
            setTodos(data);
        }
    };


    const addTodo = async (title: string, description: string) => {
        const response = await fetch('http://localhost:3000/todo/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            const data: Todo = await response.json();
            setTodos([...todos, data]);
        }
    };

 
    const markDone = async (id: string) => {
        const response = await fetch(`http://localhost:3000/todo/todos/${id}/done`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });

        if (response.ok) {
            const updatedTodo: Todo = await response.json();
            setTodos(todos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo)));
        }
    };

    useEffect(() => {
        getTodos();
    }, []);

    return { todos, addTodo, markDone };
}


const TodoList = () => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const navigate = useNavigate();
    const { todos, addTodo, markDone } = useTodo();

    const handleAddTodo = () => {
        addTodo(title, description);
        setTitle('');
        setDescription('');
    };

    return (
        <div>
            <div style={{ display: "flex" }}>
                <h2>Welcome</h2>
                <div style={{ marginTop: 25, marginLeft: 20 }}>
                    <button onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        navigate("/login");
                    }}>Logout</button>
                </div>
            </div>

            <h2>Todo List</h2>
            <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Title'
            />
            <input
                type='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Description'
            />
            <button onClick={handleAddTodo}>Add Todo</button>

            {todos.map((todo) => (
                <div key={todo._id}>
                    <h3>{todo.title}</h3>
                    <p>{todo.description}</p>
                    <button onClick={() => markDone(todo._id)}>
                        {todo.done ? 'Done' : 'Mark as Done'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TodoList;
