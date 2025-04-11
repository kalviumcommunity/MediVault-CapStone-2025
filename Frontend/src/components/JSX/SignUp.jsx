import React, { useState } from "react";
import "../CSS/Login.css"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/authSlice";  // Import Redux action
import backgroundImage from "../Assets/Background.jpg";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth); // Get auth state

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            const response = await axios.post("http://localhost:3000/api/Sign-Up", {
                name,
                email,
                password,
            });

            if (response.status === 201) {
                alert("User registered successfully");
                
                // Dispatch Redux action instead of localStorage
                dispatch(loginSuccess({ token: response.data.token, shopName: name , userEmail: email}));
                
                navigate("/Home");
            } else{
                alert("User already exists");
            }
        } catch (err) {
            console.error("Error in SignUp.jsx SignUp", err);
        }
    };

    const login = () => {
        navigate("/");
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }} 
        >
            <div className="login-box">
                <h1 className="login-title">Sign Up</h1>

                <h2>Shop Name</h2>
                <input 
                    type="text" 
                    placeholder="Enter your shop name" 
                    value={name} 
                    className="input-field" 
                    onChange={(e) => setName(e.target.value)}
                />

                <h2>Email</h2>
                <input 
                    type="text" 
                    placeholder="Enter your email" 
                    value={email} 
                    className="input-field" 
                    onChange={(e) => setEmail(e.target.value)}
                />

                <h2>Create Password</h2>
                <input 
                    type="password" 
                    placeholder="Create your password" 
                    value={password} 
                    className="input-field" 
                    onChange={(e) => setPassword(e.target.value)}
                />

                <h2>Confirm Password</h2>
                <input 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={confirmPassword} 
                    className="input-field" 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button className="login-button" onClick={handleSubmit}>Sign Up</button>

                <div>
                    <div className="already">I already have an account</div>
                    <div onClick={login} className="log">Login</div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
