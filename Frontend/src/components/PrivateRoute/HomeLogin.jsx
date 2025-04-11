import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const HomeLogin = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  

  

  // If user is authenticated and trying to access "/", redirect them to "/Home"
  if (isAuthenticated) {
    return <Navigate to="/Home" />;
  }

  return <Outlet />;
};

export default HomeLogin;
