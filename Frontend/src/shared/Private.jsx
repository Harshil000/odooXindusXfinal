import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth/auth.context";

const Private = ({ children }) => {
  const { user, checkingAuth } = useContext(AuthContext);

  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Private