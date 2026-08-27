import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <>
            <style>
                {`
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: black;
                        displaye: flex;
                        
                    }
                `}
            </style>

            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </>
    );
}

export default App;