// import React, { createContext, useContext, useState, useEffect } from "react";
// import { loginJobSeeker, loginEmployer } from "../services/api";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(() => {
//         const storedUser = localStorage.getItem("user");
//         return storedUser ? JSON.parse(storedUser) : null;
//     });

//     const login = async (email, password, role) => {
//         try {
//             const data = role === "job_seeker"
//                 ? await loginJobSeeker(email, password)
//                 : await loginEmployer(email, password);
            
//             const newUser = {
//                 email,
//                 role: data.role,
//                 user_id: data.user_id,  // Ensure this is correctly retrieved
//                 token: data.access_token
//             };

//             setUser(newUser);
//             localStorage.setItem("user", JSON.stringify(newUser));
//             localStorage.setItem("token", data.access_token);
//         } catch (error) {
//             throw new Error("Invalid credentials.");
//         }
//     };

//     const logout = () => {
//         setUser(null);
//         localStorage.removeItem("user");
//         localStorage.removeItem("token");
//     };

//     useEffect(() => {
//       console.log("Logged in user data:", user); // Debugging line
//     }, [user]);

//     return (
//         <AuthContext.Provider value={{ user, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { loginJobSeeker, loginEmployer } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // ✅ Use navigate inside the function

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const user_id = localStorage.getItem("user_id");

        if (token && role) {
            setUser({ token, role, user_id });
        }
    }, []);

    // const login = async (email, password, role) => {
    //     try {
    //         let response;
    //         if (role === "job_seeker") {
    //             response = await loginJobSeeker(email, password);
    //         } else if (role === "recruiter") {
    //             response = await loginEmployer(email, password);
    //         }

    //         const { access_token, role: userRole, user_id } = response.data;

    //         localStorage.setItem("token", access_token);
    //         localStorage.setItem("role", userRole);
    //         localStorage.setItem("user_id", user_id);

    //         setUser({ email, role: userRole, token: access_token, user_id });

    //         if (userRole === "job_seeker") {
    //             navigate("/jobs"); // ✅ Use navigate correctly
    //         } else {
    //             navigate("/my-posted-jobs"); // ✅ Use navigate correctly
    //         }
    //     } catch (error) {
    //         console.error("Login failed:", error);
    //         alert("Invalid credentials.");
    //     }
    // };

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

          console.log("User logged in:", userData); // Debugging log

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