import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJobSeekerProfile, fetchRecruiterProfile } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Load user data from localStorage on initial load
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const role = localStorage.getItem("role");
                const user_id = localStorage.getItem("user_id");
                const specific_id = localStorage.getItem("specific_id");

                // console.log("Loading user from storage:", { token, role, user_id, specific_id });

                if (token && role && user_id) {
                    // Even if specific_id is missing, we still want to set the user
                    const userData = { 
                        token, 
                        role, 
                        user_id, 
                        specific_id: specific_id || null 
                    };
                    setUser(userData);
                    
                    // Attempt to load profile even if specific_id is missing
                    // The API functions should handle this gracefully
                    try {
                        if (role === "job_seeker") {
                            const profileData = await fetchJobSeekerProfile();
                            if (profileData) {
                                setUserProfile(profileData);
                            }
                        } else if (role === "recruiter") {
                            const profileData = await fetchRecruiterProfile();
                            if (profileData) {
                                setUserProfile(profileData);
                            }
                        }
                    } catch (error) {
                        console.error("Error loading profile on app start:", error);
                        // Don't throw error, just continue with null profile
                    }
                }
            } catch (error) {
                console.error("Error loading user:", error);
                // Clear potentially corrupted auth data
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user_id");
                localStorage.removeItem("specific_id");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (userData) => {
        try {
            if (!userData || !userData.token) {
                throw new Error("Invalid login data received");
            }
    
            console.log("Login data received:", userData);
    
            // Check for missing specific_id
            if (userData.specific_id === undefined || userData.specific_id === null) {
                console.warn("No specific_id in login response!");
                
                // Create a placeholder value to prevent API errors
                // We'll handle this specially in API calls
                userData.specific_id = "pending"; 
            }
    
            // Save all user data to localStorage, handling any missing values
            localStorage.setItem("token", userData.token);
            localStorage.setItem("role", userData.role);
            localStorage.setItem("user_id", userData.user_id);
            localStorage.setItem("specific_id", String(userData.specific_id));
            
            console.log("Login successful:", {
                email: userData.email,
                role: userData.role,
                user_id: userData.user_id,
                specific_id: userData.specific_id
            });
    
            setUser(userData);
    
            // Don't try to load profile immediately if specific_id is pending
            // We'll handle this in the profile pages instead
            if (userData.specific_id !== "pending") {
                try {
                    if (userData.role === "job_seeker") {
                        const profileData = await fetchJobSeekerProfile();
                        if (profileData) {
                            setUserProfile(profileData);
                        }
                    } else if (userData.role === "recruiter") {
                        const profileData = await fetchRecruiterProfile();
                        if (profileData) {
                            setUserProfile(profileData);
                        }
                    }
                } catch (error) {
                    console.error("Error loading profile after login:", error);
                    // Continue without profile data
                }
            }
    
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
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("specific_id");
        setUser(null);
        setUserProfile(null);
        navigate("/login");
    };

    const updateProfile = (newProfileData) => {
        setUserProfile(newProfileData);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            userProfile, 
            login, 
            logout, 
            updateProfile, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);