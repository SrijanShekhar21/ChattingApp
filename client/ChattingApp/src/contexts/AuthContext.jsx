import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const AuthContextValue = useMemo(
    () => ({ token, setToken }),
    [token, setToken]
  );

  return (
    <AuthContext.Provider value={AuthContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContextProvider;
