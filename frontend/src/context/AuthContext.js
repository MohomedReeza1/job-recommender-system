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
    
            // Ensure specific_id is properly handled by explicitly checking and converting
            // Extract the specific_id, ensuring we get it as a number or null
            let specificId = null;
            
            // Check if specific_id exists and is a valid number
            if (userData.specific_id !== undefined && 
                userData.specific_id !== null && 
                userData.specific_id !== "pending") {
                
                // Convert to number if it's a string or already a number
                specificId = typeof userData.specific_id === 'string' 
                    ? Number(userData.specific_id) 
                    : userData.specific_id;
                    
                // Verify it's actually a number after conversion
                if (isNaN(specificId)) {
                    specificId = null;
                }
            }
            
            console.log("Specific ID validation:", {
                original: userData.specific_id,
                type: typeof userData.specific_id,
                parsed: specificId,
                isNumber: !isNaN(specificId)
            });
            
            // Determine what to store - use the parsed ID if it's valid, otherwise "pending"
            const specificIdToStore = specificId !== null ? String(specificId) : "pending";
            
            // Save user data to localStorage
            localStorage.setItem("token", userData.access_token || userData.token);
            localStorage.setItem("role", userData.role);
            localStorage.setItem("user_id", userData.user_id);
            localStorage.setItem("specific_id", specificIdToStore);
            
            // Also store email if available
            if (userData.email) {
                localStorage.setItem("email", userData.email);
            }
            
            console.log("Storing in localStorage:", {
                role: userData.role,
                user_id: userData.user_id,
                specific_id: specificIdToStore
            });
    
            // Create a user object with the clean values
            const userObject = {
                ...userData,
                token: userData.access_token || userData.token,
                specific_id: specificIdToStore
            };
            
            setUser(userObject);
    
            // Only try to create a profile if specific_id is "pending"
            if (userData.role === "recruiter" && specificIdToStore === "pending") {
                try {
                    console.log("Attempting to create/fetch recruiter profile after login");
                    const profileData = await fetchRecruiterProfile();
                    
                    // If we got a valid profile with an ID, update the user data
                    if (profileData && profileData.agency_id) {
                        const updatedSpecificId = String(profileData.agency_id);
                        
                        // Update localStorage and user state
                        localStorage.setItem("specific_id", updatedSpecificId);
                        
                        // Update user object
                        setUser(prev => ({...prev, specific_id: updatedSpecificId}));
                        
                        console.log("Updated specific_id after profile fetch:", updatedSpecificId);
                    }
                } catch (profileError) {
                    console.error("Error loading/creating profile after login:", profileError);
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