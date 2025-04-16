import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice"; // Import the action
import "../CSS/Login.css"; 
import backgroundImage from "../Assets/Background.jpg"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Get dispatch function from Redux

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/Login", {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        alert("Login Successful");

        // Dispatch login action to Redux store
        dispatch(loginSuccess({ token: response.data.token, shopName: response.data.shopName, userEmail: response.data.email }));

        navigate("/Home");
      
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert("User doesn't exist or incorrect credentials");
      } else {
        console.error("Error in Login.jsx Login", err);
        alert("Incorrect credentials")
      }
    }
  };

  return (
    <div 
      className="login-wrapper"
      style={{
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100vw',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }} 
    >
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        <h2>Email</h2>
        <input
          type="text"
          placeholder="Enter your email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <h2>Password</h2>
        <input
          type="password"
          placeholder="Enter your password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          Login
        </button>

        <div>
          <div className="already">I don't have an account</div>
          <div onClick={() => navigate("/SignUp")} className="log">Sign Up</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
