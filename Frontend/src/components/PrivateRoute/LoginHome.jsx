import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const LoginHome = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default LoginHome;
