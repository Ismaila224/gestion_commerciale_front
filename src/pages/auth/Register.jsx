import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Divider,
    InputAdornment,
    IconButton,
} from "@mui/material";

import {
    StorefrontOutlined,
    Person,
    EmailOutlined,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";

import { useAuth } from "../../context/AuthContext";

function Register() {

    const navigate = useNavigate();

    const { register } = useAuth();

    const [formulaire, setFormulaire] = useState({
        boutique_nom: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [erreur, setErreur] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

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

        if (
            formulaire.password !==
            formulaire.password_confirmation
        ) {
            setErreur(
                "Les mots de passe ne correspondent pas."
            );

            setLoading(false);

            return;
        }

        try {

            await register(formulaire);

            navigate("/dashboard", {
                replace: true,
            });

        } catch (error) {

            console.log(
                "ERREUR INSCRIPTION :",
                error.response
            );

            if (
                error.response?.status === 422
            ) {

                const errors =
                    error.response.data.errors;

                if (errors) {

                    const premierErreur =
                        Object.values(errors)[0]?.[0];

                    setErreur(
                        premierErreur ||
                        "Veuillez vérifier les informations saisies."
                    );

                } else {

                    setErreur(
                        error.response.data.message ||
                        "Les informations saisies sont invalides."
                    );
                }

            } else {

                setErreur(
                    error.response?.data?.message ||
                    "Une erreur est survenue. Veuillez réessayer."
                );
            }

        } finally {

            setLoading(false);
        }
    }

    /*
     * STYLE DES INPUTS
     * Hauteur réduite pour tenir dans l'écran.
     */
    const inputStyle = {

        mb: 0.5,

        "& .MuiInputLabel-root": {
            color: "#94A3B8",
            fontSize: 12,
        },

        "& .MuiInputLabel-root.Mui-focused": {
            color: "#A78BFA",
        },

        "& .MuiOutlinedInput-root": {

            height: 38,

            color: "white",

            borderRadius: 2,

            backgroundColor: "#0B1120",

            fontSize: 12,

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

    const iconStyle = {
        color: "#94A3B8",
        fontSize: 18,
    };

    return (

        <Box
            sx={{
                width: "100%",
                height: "100vh",
                maxHeight: "100vh",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                boxSizing: "border-box",

                px: 1,
                py: 1,

                overflow: "hidden",
                marginTop: -4.5,

                background:
                    "linear-gradient(135deg, #020617 0%, #111827 55%, #1e1b4b 100%)",
            }}
        >

            <Paper
                elevation={0}
                sx={{

                    width: "100%",
                    maxWidth: 480,

                    height: "80vh",
                    maxHeight: "80vh",

                    boxSizing: "border-box",

                    p: {
                        xs: 1.5,
                        sm: 2,
                    },

                    borderRadius: 3,

                    backgroundColor: "#111827",

                    border: "1px solid #374151",

                    boxShadow:
                        "0 20px 50px rgba(0,0,0,0.45)",

                    /*
                     * Pas de scrollbar.
                     */
                    overflow: "hidden",
                }}
            >

                {/* =========================
                    LOGO
                ========================== */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 0.5,
                    }}
                >

                    <Box
                        sx={{
                            width: 40,
                            height: 40,

                            borderRadius: 2,

                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",

                            background:
                                "linear-gradient(135deg, #7C3AED, #4F46E5)",

                            boxShadow:
                                "0 6px 20px rgba(124,58,237,0.30)",
                        }}
                    >

                        <StorefrontOutlined
                            sx={{
                                color: "white",
                                fontSize: 22,
                            }}
                        />

                    </Box>

                </Box>


                {/* =========================
                    TITRE
                ========================== */}

                <Typography
                    variant="h5"
                    align="center"
                    sx={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: 20,
                        mb: 0.2,
                    }}
                >
                    Créer votre boutique
                </Typography>


                <Typography
                    align="center"
                    sx={{
                        color: "#94A3B8",
                        fontSize: 10,
                        mb: 1,
                    }}
                >
                    Configurez votre espace de gestion commerciale
                </Typography>


                {/* =========================
                    ERREUR
                ========================== */}

                {erreur && (

                    <Alert
                        severity="error"
                        sx={{
                            mb: 1,
                            borderRadius: 1.5,
                            py: 0,
                            fontSize: 11,
                        }}
                    >
                        {erreur}
                    </Alert>

                )}


                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                    {/* =========================
                        SECTION BOUTIQUE
                    ========================== */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            mb: 0.4,
                        }}
                    >

                        <StorefrontOutlined
                            sx={{
                                color: "#A78BFA",
                                fontSize: 19,
                            }}
                        />

                        <Box>

                            <Typography
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: 12,
                                }}
                            >
                                Informations de la boutique
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#64748B",
                                    fontSize: 9,
                                }}
                            >
                                Présentez votre commerce
                            </Typography>

                        </Box>

                    </Box>


                    {/* NOM BOUTIQUE */}

                    <TextField
                        fullWidth
                        label="Nom de la boutique"
                        name="boutique_nom"
                        value={formulaire.boutique_nom}
                        onChange={handleChange}
                        margin="dense"
                        required
                        sx={inputStyle}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">

                                    <StorefrontOutlined
                                        sx={iconStyle}
                                    />

                                </InputAdornment>
                            ),
                        }}
                    />


                    {/* SEPARATION */}

                    <Divider
                        sx={{
                            borderColor: "#374151",
                            my: 0.8,
                        }}
                    />


                    {/* =========================
                        SECTION ADMIN
                    ========================== */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            mb: 0.4,
                        }}
                    >

                        <Person
                            sx={{
                                color: "#A78BFA",
                                fontSize: 19,
                            }}
                        />

                        <Box>

                            <Typography
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: 12,
                                }}
                            >
                                Compte administrateur
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#64748B",
                                    fontSize: 9,
                                }}
                            >
                                Vos informations de connexion
                            </Typography>

                        </Box>

                    </Box>


                    {/* =========================
                        NOM
                    ========================== */}

                    <TextField
                        fullWidth
                        label="Nom complet"
                        name="name"
                        value={formulaire.name}
                        onChange={handleChange}
                        margin="dense"
                        required
                        sx={inputStyle}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">

                                    <Person
                                        sx={iconStyle}
                                    />

                                </InputAdornment>
                            ),
                        }}
                    />


                    {/* =========================
                        EMAIL
                    ========================== */}

                    <TextField
                        fullWidth
                        label="Adresse email"
                        name="email"
                        type="email"
                        value={formulaire.email}
                        onChange={handleChange}
                        margin="dense"
                        required
                        sx={inputStyle}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">

                                    <EmailOutlined
                                        sx={iconStyle}
                                    />

                                </InputAdornment>
                            ),
                        }}
                    />


                    {/* =========================
                        MOT DE PASSE
                    ========================== */}

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
                        margin="dense"
                        required
                        sx={inputStyle}
                        InputProps={{

                            startAdornment: (
                                <InputAdornment position="start">

                                    <LockOutlined
                                        sx={iconStyle}
                                    />

                                </InputAdornment>
                            ),

                            endAdornment: (
                                <InputAdornment position="end">

                                    <IconButton
                                        size="small"
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
                                                    fontSize: 18,
                                                }}
                                            />

                                        ) : (

                                            <Visibility
                                                sx={{
                                                    color: "#94A3B8",
                                                    fontSize: 18,
                                                }}
                                            />

                                        )}

                                    </IconButton>

                                </InputAdornment>
                            ),
                        }}
                    />


                    {/* =========================
                        CONFIRMATION
                    ========================== */}

                    <TextField
                        fullWidth
                        label="Confirmer le mot de passe"
                        name="password_confirmation"
                        type={
                            showConfirmation
                                ? "text"
                                : "password"
                        }
                        value={
                            formulaire.password_confirmation
                        }
                        onChange={handleChange}
                        margin="dense"
                        required
                        sx={inputStyle}
                        InputProps={{

                            startAdornment: (
                                <InputAdornment position="start">

                                    <LockOutlined
                                        sx={iconStyle}
                                    />

                                </InputAdornment>
                            ),

                            endAdornment: (
                                <InputAdornment position="end">

                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            setShowConfirmation(
                                                !showConfirmation
                                            )
                                        }
                                        edge="end"
                                    >

                                        {showConfirmation ? (

                                            <VisibilityOff
                                                sx={{
                                                    color: "#94A3B8",
                                                    fontSize: 18,
                                                }}
                                            />

                                        ) : (

                                            <Visibility
                                                sx={{
                                                    color: "#94A3B8",
                                                    fontSize: 18,
                                                }}
                                            />

                                        )}

                                    </IconButton>

                                </InputAdornment>
                            ),
                        }}
                    />


                    {/* =========================
                        BOUTON INSCRIPTION
                    ========================== */}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{

                            height: 38,

                            mt: 0.3,

                            borderRadius: 2,

                            textTransform: "none",

                            fontSize: 12,

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
                            ? "Création du compte..."
                            : "Créer mon compte"
                        }

                    </Button>


                    {/* =========================
                        RETOUR LOGIN
                    ========================== */}

                    <Button
                        fullWidth
                        variant="text"
                        sx={{
                            mt: 0,

                            color: "#94A3B8",

                            textTransform: "none",

                            fontSize: 11,

                            minHeight: 28,

                            "&:hover": {
                                color: "#C4B5FD",

                                backgroundColor:
                                    "rgba(124,58,237,0.08)",
                            },
                        }}
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Déjà un compte ?
                        &nbsp;
                        Se connecter
                    </Button>

                </Box>


                {/* =========================
                    FOOTER
                ========================== */}

                <Typography
                    align="center"
                    sx={{
                        color: "#475569",
                        fontSize: 9,
                        mt: 0.2,
                    }}
                >
                    GesCom — Gestion commerciale
                </Typography>

            </Paper>

        </Box>
    );
}

export default Register;