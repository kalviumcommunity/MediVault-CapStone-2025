import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/JSX/Login";
import SignUp from "./components/JSX/SignUp";
import Home from "./components/JSX/Home";
import Billing from "./components/JSX/Bill";
import LoginHome from "./components/PrivateRoute/LoginHome";
import HomeLogin from "./components/PrivateRoute/HomeLogin";
import Stock from "./components/JSX/Stock";
import Profile from "./components/JSX/Profile"

function App() {
  return (
    <Router>
      <Routes>
        {/* Protect login page */}
        <Route element={<HomeLogin />}>
          <Route path="/" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
        </Route>
        
        

        {/* Protect Home and Billing Pages */}
        <Route element={<LoginHome />}>
          <Route path="/Home" element={<Home />} />
          <Route path="/Billing" element={<Billing />} />
          <Route path="/Stock" element={<Stock />} />
          <Route path="/Profile" element={<Profile/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
