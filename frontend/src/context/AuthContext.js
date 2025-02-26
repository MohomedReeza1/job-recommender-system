import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const user_id = localStorage.getItem("user_id");

        if (token && role) {
            setUser({ token, role, user_id });
        }
    }, []);

    const login = async (userData) => {
      try {
          if (!userData || !userData.token) {
              throw new Error("Invalid login data received");
          }

          // Store user details in localStorage
          localStorage.setItem("token", userData.token);
          localStorage.setItem("role", userData.role);
          localStorage.setItem("user_id", userData.user_id);

          setUser(userData);

          // Redirect after login based on role
          if (userData.role === "job_seeker") {
              navigate("/jobs");
          } else if (userData.role === "recruiter") {
              navigate("/my-posted-jobs");
          }
      } catch (error) {
          console.error("Login failed:", error);
          alert("Login failed. Please try again.");
      }
    };
  
    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
    };

    useEffect(() => {
      console.log("Logged in user data:", user); // Debugging line
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);