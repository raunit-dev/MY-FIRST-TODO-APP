import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { SignUpParams } from '@raunit/common';

const Login = () => {
    const [username, setUsername] = useState<SignUpParams["username"]>('');
    const [password, setPassword] = useState<SignUpParams["password"]>('');
    const navigate =useNavigate();

    const handleLogin = async () => {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        // Todo: Create a type for the response that you get back from the server
        const data = await response.json();
        if (data.accessToken&&data.refreshToken) {
            localStorage.setItem("accessToken", data.accessToken)
            localStorage.setItem("refreshToken" ,data.refreshToken)
            navigate("/todos");
        } else {
            alert("invalid credentials");
        }
    };

    return (
        <div style={{justifyContent: "center", display: "flex", width: "100%"}}>
            <div>
                <h2>Login</h2>
                <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' />
                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
                New here? <Link to="/signup">Signup</Link>
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default Login;
