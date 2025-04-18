import React from 'react'
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/review-orders');
    }
    
  return (
    <div>Login</div>
  )
}

export default Login