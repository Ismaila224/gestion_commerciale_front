import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getUser,
    login as loginService,
    register as registerService,
    logout as logoutService,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function verifierUtilisateur() {

            const token = localStorage.getItem("token");

            console.log(
                "TOKEN AU DEMARRAGE :",
                token
            );

            if (!token) {

                setUser(null);
                setLoading(false);

                return;
            }

            try {

                const currentUser = await getUser();

                console.log(
                    "UTILISATEUR RECUPERE :",
                    currentUser
                );

                setUser(currentUser);

            } catch (error) {

                console.log(
                    "TOKEN INVALIDE OU ERREUR :",
                    error
                );

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setUser(null);

            } finally {

                setLoading(false);
            }
        }

        verifierUtilisateur();

    }, []);

    // =========================
    // LOGIN
    // =========================

    async function login(credentials) {

        const currentUser =
            await loginService(credentials);

        setUser(currentUser);

        return currentUser;
    }

    // =========================
    // REGISTER
    // =========================

    async function register(data) {

        const currentUser =
            await registerService(data);

        setUser(currentUser);

        return currentUser;
    }

    // =========================
    // LOGOUT
    // =========================

    async function logout() {

        try {

            await logoutService();

        } finally {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
        }
    }

    const isAuthenticated = !!user;

    return (

        <AuthContext.Provider
            value={{
                user,
                setUser,

                login,
                register,
                logout,

                isAuthenticated,
                loading,
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);
}

