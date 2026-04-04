import { createContext , useState } from "react";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);
    const [token, setToken] = useState(null);

    return (
        <AuthContext.Provider value={{ user, loading, error, token, setUser, setLoading, setError, setToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;