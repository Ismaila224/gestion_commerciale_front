import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";

import {
    StorefrontOutlined,
    EmailOutlined,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";

import { useAuth } from "../../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formulaire, setFormulaire] = useState({
        email: "",
        password: "",
    });

    const [erreur, setErreur] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e) {
        setFormulaire({
            ...formulaire,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setErreur("");
        setLoading(true);

        try {
            await login(formulaire);

            navigate("/dashboard", {
                replace: true,
            });

        } catch (error) {

            if (error.response?.status === 422) {

                setErreur(
                    error.response.data.message ||
                    "Email ou mot de passe incorrect."
                );

            } else if (error.response?.status === 401) {

                setErreur(
                    "Email ou mot de passe incorrect."
                );

            } else {

                setErreur(
                    "Une erreur est survenue. Veuillez réessayer."
                );

            }

        } finally {
            setLoading(false);
        }
    }

    const inputStyle = {

        mb: 2,

        "& .MuiInputLabel-root": {
            color: "#94A3B8",
        },

        "& .MuiInputLabel-root.Mui-focused": {
            color: "#A78BFA",
        },

        "& .MuiOutlinedInput-root": {

            color: "white",

            borderRadius: 2,

            backgroundColor: "#0B1120",

            "& fieldset": {
                borderColor: "#374151",
            },

            "&:hover fieldset": {
                borderColor: "#7C3AED",
            },

            "&.Mui-focused fieldset": {
                borderColor: "#7C3AED",
            },
        },
    };

    return (

        <Box
            sx={{
                minHeight: "100vh",
                marginTop: -4.5,
                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                px: 2,

                background:
                    "linear-gradient(135deg, #020617 0%, #111827 55%, #1e1b4b 100%)",
            }}
        >

            <Paper
                elevation={0}
                sx={{

                    width: "100%",

                    maxWidth: 430,

                    p: {
                        xs: 3,
                        sm: 5,
                    },

                    borderRadius: 4,

                    backgroundColor: "#111827",

                    border: "1px solid #374151",

                    boxShadow:
                        "0 25px 60px rgba(0,0,0,0.45)",
                }}
            >

                {/* LOGO */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >

                    <Box
                        sx={{
                            width: 65,
                            height: 65,

                            borderRadius: 3,

                            display: "flex",

                            justifyContent: "center",

                            alignItems: "center",

                            background:
                                "linear-gradient(135deg, #7C3AED, #4F46E5)",

                            boxShadow:
                                "0 10px 30px rgba(124,58,237,0.35)",
                        }}
                    >

                        <StorefrontOutlined
                            sx={{
                                color: "white",
                                fontSize: 36,
                            }}
                        />

                    </Box>

                </Box>


                {/* TITRE */}

                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        color: "white",
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Bienvenue sur GesCom
                </Typography>


                <Typography
                    align="center"
                    sx={{
                        color: "#94A3B8",
                        mb: 4,
                        fontSize: 14,
                    }}
                >
                    Connectez-vous à votre boutique
                </Typography>


                {/* ERREUR */}

                {erreur && (

                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                        }}
                    >
                        {erreur}
                    </Alert>

                )}


                {/* FORMULAIRE */}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                    <TextField
                        fullWidth
                        label="Adresse email"
                        name="email"
                        type="email"
                        value={formulaire.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                        sx={inputStyle}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlined
                                        sx={{
                                            color: "#94A3B8",
                                        }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />


                    <TextField
                        fullWidth
                        label="Mot de passe"
                        name="password"
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        value={formulaire.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        sx={inputStyle}
                        InputProps={{

                            startAdornment: (
                                <InputAdornment position="start">

                                    <LockOutlined
                                        sx={{
                                            color: "#94A3B8",
                                        }}
                                    />

                                </InputAdornment>
                            ),

                            endAdornment: (
                                <InputAdornment position="end">

                                    <IconButton
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        edge="end"
                                    >

                                        {showPassword ? (

                                            <VisibilityOff
                                                sx={{
                                                    color: "#94A3B8",
                                                }}
                                            />

                                        ) : (

                                            <Visibility
                                                sx={{
                                                    color: "#94A3B8",
                                                }}
                                            />

                                        )}

                                    </IconButton>

                                </InputAdornment>
                            ),
                        }}
                    />


                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{

                            height: 48,

                            mt: 1,

                            borderRadius: 2,

                            textTransform: "none",

                            fontSize: 15,

                            fontWeight: 600,

                            background:
                                "linear-gradient(135deg, #7C3AED, #4F46E5)",

                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #6D28D9, #4338CA)",
                            },
                        }}
                    >

                        {loading
                            ? "Connexion..."
                            : "Se connecter"
                        }

                    </Button>


                    {/* SEPARATION */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            my: 3,
                        }}
                    >

                        <Box
                            sx={{
                                flex: 1,
                                height: "1px",
                                backgroundColor: "#374151",
                            }}
                        />

                        <Typography
                            sx={{
                                color: "#64748B",
                                fontSize: 12,
                            }}
                        >
                            OU
                        </Typography>

                        <Box
                            sx={{
                                flex: 1,
                                height: "1px",
                                backgroundColor: "#374151",
                            }}
                        />

                    </Box>


                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() =>
                            navigate("/register")
                        }
                        startIcon={
                            <StorefrontOutlined />
                        }
                        sx={{

                            height: 46,

                            borderRadius: 2,

                            textTransform: "none",

                            color: "#C4B5FD",

                            borderColor: "#4C1D95",

                            "&:hover": {

                                borderColor: "#7C3AED",

                                backgroundColor:
                                    "rgba(124,58,237,0.08)",
                            },
                        }}
                    >
                        Créer une boutique
                    </Button>

                </Box>


                <Typography
                    align="center"
                    sx={{
                        color: "#64748B",
                        fontSize: 12,
                        mt: 3,
                    }}
                >
                    Gestion commerciale simple et efficace
                </Typography>

            </Paper>

        </Box>
    );
}

export default Login;