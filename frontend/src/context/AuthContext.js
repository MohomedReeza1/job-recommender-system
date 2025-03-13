import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJobSeekerProfile, fetchRecruiterProfile, fetchAgencyIdForUser } from "../services/api";

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

                console.log("Loading from localStorage:", { token: !!token, role, user_id, specific_id });

                if (token && role && user_id) {
                    const userData = { 
                        token, 
                        role, 
                        user_id, 
                        specific_id: specific_id || null 
                    };
                    setUser(userData);
                    
                    try {
                        // Load appropriate profile based on role
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
                    }
                }
            } catch (error) {
                console.error("Error loading user:", error);
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
            // Enhanced validation with detailed logging
            if (!userData) {
                console.error("userData is completely missing");
                throw new Error("Invalid login data received: userData is null or undefined");
            }
            
            // Log the input data exactly as received
            console.log("Login data received:", userData);
            
            // Verify token existence with better debug info
            const token = userData.token || userData.access_token;
            if (!token) {
                console.error("No token found in userData:", userData);
                throw new Error("Invalid login data received: No token found");
            }
            
            // Extract other essential data
            const userId = userData.user_id;
            const role = userData.role;
            
            // Additional validation
            if (!userId || !role) {
                console.error("Missing critical data:", { userId, role });
                throw new Error("Invalid login data: Missing user_id or role");
            }
            
            // Save the basic user data immediately
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("user_id", userId);
            
            // Extract specific_id directly from response if available
            let specificId = userData.specific_id;
            console.log("Raw specific_id from response:", specificId, "Type:", typeof specificId);
            
            // If specific_id is missing, fetch it based on role
            if ((!specificId || specificId === undefined || specificId === null) && role === "recruiter") {
                console.log("specific_id is missing in login response, attempting to fetch it");
                
                try {
                    specificId = await fetchAgencyIdForUser();
                    console.log("Fetched specific_id for recruiter:", specificId);
                    
                    if (specificId) {
                        // Update the userData object with the fetched specific_id
                        userData.specific_id = specificId;
                    }
                } catch (fetchError) {
                    console.error("Error fetching specific_id:", fetchError);
                }
            }
            
            // Now save specific_id to localStorage if we have it
            if (specificId !== undefined && specificId !== null) {
                const specificIdString = String(specificId);
                console.log("Saving specific_id to localStorage:", specificIdString);
                localStorage.setItem("specific_id", specificIdString);
            } else {
                console.warn("Could not determine specific_id");
                localStorage.setItem("specific_id", "");
            }
            
            // For debugging - check what was stored
            console.log("Verifying localStorage after saving:");
            console.log("- token:", localStorage.getItem("token") ? "saved" : "missing");
            console.log("- role:", localStorage.getItem("role"));
            console.log("- user_id:", localStorage.getItem("user_id"));
            console.log("- specific_id:", localStorage.getItem("specific_id"));
            
            // Create user object with consistent properties
            const userObject = {
                token: token,
                role: role,
                user_id: userId,
                specific_id: specificId
            };
            
            setUser(userObject);
            
            // Also load the profile data based on role
            try {
                if (role === "job_seeker") {
                    const profileData = await fetchJobSeekerProfile();
                    setUserProfile(profileData);
                } else if (role === "recruiter") {
                    const profileData = await fetchRecruiterProfile();
                    setUserProfile(profileData);
                }
            } catch (profileError) {
                console.error("Error loading profile after login:", profileError);
            }
            
            // Redirect based on role
            if (role === "job_seeker") {
                navigate("/jobs");
            } else if (role === "recruiter") {
                navigate("/my-posted-jobs");
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again: " + error.message);
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