import { useEffect, useState } from "react";
import { getFournisseurs, createFournisseur, updateFournisseur, deleteFournisseur } from "../../services/fournisseurService";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Stack, Pagination, Dialog, DialogActions,
    DialogContent, DialogTitle, Button, TextField, Box, Typography, InputAdornment
} from "@mui/material";
import { Person, Phone, Email, Home } from "@mui/icons-material";

function FournisseurList() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [page, setPage] = useState(1);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [fournisseurASupprimer, setFournisseurASupprimer] = useState(null);
    const [fournisseurAModifier, setFournisseurAModifier] = useState(null);
    const [loadingForm, setLoadingForm] = useState(false);
    const [erreur, setErreur] = useState("");
    const itemsPerPage = 4;

    const [formulaire, setFormulaire] = useState({
        nom: "",
        telephone: "",
        email: "",
        adresse: ""
    });

    useEffect(() => {
        const chargerFournisseurs = async () => {
            try {
                const data = await getFournisseurs();
                setFournisseurs(data || []);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                toast.error("Impossible de charger les fournisseurs.");
            } finally {
                setLoading(false);
            }
        };
        chargerFournisseurs();
    }, []);

    const handleChange = (e) => {
        setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
    };

    const resetFormulaire = () => {
        setFormulaire({
            nom: "",
            telephone: "",
            email: "",
            adresse: ""
        });
        setErreur("");
        setFournisseurAModifier(null);
    };

    const ouvrirAjout = () => {
        resetFormulaire();
        setOpenForm(true);
    };

    const ouvrirModification = (fournisseur) => {
        setErreur("");
        setFournisseurAModifier(fournisseur);
        setFormulaire({
            nom: fournisseur.nom || "",
            telephone: fournisseur.telephone || "",
            email: fournisseur.email || "",
            adresse: fournisseur.adresse || ""
        });
        setOpenForm(true);
    };

    const fermerFormulaire = () => {
        if (loadingForm) return;
        setOpenForm(false);
        resetFormulaire();
    };

    const enregistrerFournisseur = async (e) => {
        e.preventDefault();
        setErreur("");
        setLoadingForm(true);

        try {
            if (fournisseurAModifier) {
                const fournisseurModifie = await updateFournisseur(
                    fournisseurAModifier.id,
                    formulaire
                );

                setFournisseurs(prev =>
                    prev.map(fournisseur =>
                        fournisseur.id === fournisseurAModifier.id
                            ? { ...fournisseur, ...fournisseurModifie }
                            : fournisseur
                    )
                );

                toast.success("Fournisseur modifié avec succès !");
            } else {
                const nouveauFournisseur = await createFournisseur(formulaire);

                setFournisseurs(prev => [
                    nouveauFournisseur,
                    ...prev
                ]);

                setPage(1);
                toast.success("Fournisseur ajouté avec succès !");
            }

            setOpenForm(false);
            resetFormulaire();
        } catch (error) {
            console.error("Erreur :", error);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const premierErreur = errors
                    ? Object.values(errors)[0]?.[0]
                    : null;

                setErreur(
                    premierErreur ||
                    error.response.data.message ||
                    "Veuillez vérifier les informations saisies."
                );
            } else {
                setErreur(
                    error.response?.data?.message ||
                    "Une erreur est survenue."
                );
            }
        } finally {
            setLoadingForm(false);
        }
    };

    const ouvrirSuppression = (fournisseur) => {
        setFournisseurASupprimer(fournisseur);
        setOpenDelete(true);
    };

    const fermerSuppression = () => {
        setOpenDelete(false);
        setFournisseurASupprimer(null);
    };

    const supprimerFournisseurConfirm = async () => {
        if (!fournisseurASupprimer) return;

        try {
            await deleteFournisseur(fournisseurASupprimer.id);

            setFournisseurs(prev =>
                prev.filter(
                    fournisseur =>
                        fournisseur.id !== fournisseurASupprimer.id
                )
            );

            toast.success("Fournisseur supprimé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            toast.error("Impossible de supprimer le fournisseur.");
        } finally {
            fermerSuppression();
        }
    };

    const fournisseursFiltres = fournisseurs.filter(fournisseur => {
        const texte = `${fournisseur.nom || ""} ${fournisseur.telephone || ""} ${fournisseur.email || ""}`;
        return texte.toLowerCase().includes(recherche.toLowerCase());
    });

    const totalPages = Math.ceil(
        fournisseursFiltres.length / itemsPerPage
    );

    const fournisseursPage = fournisseursFiltres.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const inputStyle = {
        mb: 1.4,
        "& .MuiInputLabel-root": {
            color: "#94A3B8",
            fontSize: 13
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: "#A78BFA"
        },
        "& .MuiOutlinedInput-root": {
            height: 43,
            color: "white",
            backgroundColor: "#0B1120",
            borderRadius: 2,
            fontSize: 13,
            "& fieldset": {
                borderColor: "#374151"
            },
            "&:hover fieldset": {
                borderColor: "#7C3AED"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#7C3AED"
            }
        }
    };

    const dialogProps = {
        slotProps: {
            backdrop: {
                sx: {
                    backgroundColor: "rgba(2,6,23,0.68)",
                    backdropFilter: "blur(1px)",
                    WebkitBackdropFilter: "blur(1px)"
                }
            },
            paper: {
                sx: {
                    backgroundColor: "#111827",
                    color: "white",
                    borderRadius: "18px",
                    border: "1px solid rgba(148,163,184,0.15)",
                    boxShadow: "0 25px 70px rgba(0,0,0,0.60)"
                }
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ color: "#94A3B8", p: 3 }}>
                Chargement des fournisseurs...
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, color: "white" }}>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                gap: 2,
                flexWrap: "wrap"
            }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                        Fournisseurs
                    </Typography>
                    <Typography sx={{ color: "#94A3B8", fontSize: 14 }}>
                        {fournisseurs.length} fournisseurs enregistrés
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher un fournisseur..."
                        value={recherche}
                        onChange={e => {
                            setRecherche(e.target.value);
                            setPage(1);
                        }}
                        sx={{
                            width: 250,
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#111827",
                                color: "#94A3B8",
                                borderRadius: 2,
                                "& fieldset": {
                                    borderColor: "#374151"
                                },
                                "&:hover fieldset": {
                                    borderColor: "#7C3AED"
                                }
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={ouvrirAjout}
                        sx={{
                            height: 40,
                            backgroundColor: "#7C3AED",
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: "#6D28D9"
                            }
                        }}
                    >
                        Ajouter un fournisseur
                    </Button>
                </Box>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    backgroundColor: "#111827",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #1F2937"
                }}
            >
                <Table>
                    <TableHead sx={{ backgroundColor: "#111827" }}>
                        <TableRow>
                            {["Nom complet", "Téléphone", "Email", "Adresse", "Total Achat", "Total Dette", "Actions"].map((title, index) => (
                                <TableCell
                                    key={title}
                                    align={index === 6 ? "center" : "left"}
                                    sx={{ color: "#94A3B8" }}
                                >
                                    {title}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "#0c101a" }}>
                        {fournisseursPage.map(fournisseur => (
                            <TableRow key={fournisseur.id}>
                                <TableCell sx={{ color: "white" }}>
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.2
                                    }}>
                                        <Box sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: "50%",
                                            backgroundColor: "#312E81",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#C4B5FD",
                                            fontWeight: 700
                                        }}>
                                            {fournisseur.nom?.charAt(0).toUpperCase()}
                                        </Box>

                                        <Box>
                                            <Typography sx={{
                                                color: "white",
                                                fontWeight: 600
                                            }}>
                                                {fournisseur.nom || "-"}
                                            </Typography>

                                            <Typography sx={{
                                                color: "#64748B",
                                                fontSize: 12
                                            }}>
                                                Fournisseur
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ color: "white" }}>
                                    {fournisseur.telephone || "-"}
                                </TableCell>

                                <TableCell sx={{ color: "#94A3B8" }}>
                                    {fournisseur.email || "-"}
                                </TableCell>

                                <TableCell sx={{ color: "#94A3B8" }}>
                                    {fournisseur.adresse || "-"}
                                </TableCell>

                                <TableCell sx={{
                                    color: "#10B981",
                                    fontWeight: 600
                                }}>
                                    {fournisseur.total_achat ?? 0} F
                                </TableCell>

                                <TableCell sx={{
                                    color: "#EF4444",
                                    fontWeight: 600
                                }}>
                                    {fournisseur.total_dette ?? 0} F
                                </TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Modifier">
                                        <IconButton
                                            sx={{ color: "#60A5FA" }}
                                            onClick={() => ouvrirModification(fournisseur)}
                                        >
                                            <FaEdit />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Supprimer">
                                        <IconButton
                                            sx={{ color: "#EF4444" }}
                                            onClick={() => ouvrirSuppression(fournisseur)}
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}

                        {fournisseursPage.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    align="center"
                                    sx={{ color: "#64748B", py: 5 }}
                                >
                                    Aucun fournisseur trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} sx={{ mt: 2 }}>
                <Pagination
                    count={totalPages || 1}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    variant="outlined"
                    shape="rounded"
                    sx={{
                        "& .MuiPaginationItem-root": {
                            color: "#94A3B8",
                            borderColor: "#374151"
                        },
                        "& .MuiPaginationItem-root.Mui-selected": {
                            backgroundColor: "#7C3AED",
                            color: "white",
                            borderColor: "#7C3AED",
                            "&:hover": {
                                backgroundColor: "#6D28D9"
                            }
                        }
                    }}
                />
            </Stack>

            <Dialog
                open={openForm}
                onClose={(event, reason) => {
                    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
                }}
                disableEscapeKeyDown
                fullWidth
                maxWidth="sm"
                {...dialogProps}
            >
                <Box component="form" onSubmit={enregistrerFournisseur}>
                    <DialogTitle sx={{
                        px: 3,
                        pt: 3,
                        pb: 2,
                        borderBottom: "1px solid rgba(148,163,184,0.10)"
                    }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.7
                        }}>
                            <Box sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)"
                            }}>
                                <Person sx={{
                                    color: "white",
                                    fontSize: 26
                                }} />
                            </Box>

                            <Box>
                                <Typography sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 19
                                }}>
                                    {fournisseurAModifier
                                        ? "Modifier le fournisseur"
                                        : "Ajouter un fournisseur"}
                                </Typography>

                                <Typography sx={{
                                    color: "#94A3B8",
                                    fontSize: 12
                                }}>
                                    {fournisseurAModifier
                                        ? "Modifiez les informations du fournisseur"
                                        : "Enregistrez un nouveau fournisseur dans votre boutique"}
                                </Typography>
                            </Box>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{
                        backgroundColor: "#111827",
                        px: 3,
                        pt: "24px !important",
                        pb: 1
                    }}>
                        {erreur && (
                            <Box sx={{
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                backgroundColor: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.25)"
                            }}>
                                <Typography sx={{
                                    color: "#F87171",
                                    fontSize: 13
                                }}>
                                    {erreur}
                                </Typography>
                            </Box>
                        )}

                        <Typography sx={{
                            color: "#CBD5E1",
                            fontWeight: 600,
                            fontSize: 13,
                            mb: 1.5
                        }}>
                            Informations du fournisseur
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            label="Nom complet"
                            name="nom"
                            value={formulaire.nom}
                            onChange={handleChange}
                            required
                            sx={inputStyle}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{
                                                color: "#64748B",
                                                fontSize: 20
                                            }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="Téléphone"
                            name="telephone"
                            value={formulaire.telephone}
                            onChange={handleChange}
                            required
                            sx={inputStyle}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone sx={{
                                                color: "#64748B",
                                                fontSize: 20
                                            }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="Adresse email"
                            name="email"
                            type="email"
                            value={formulaire.email}
                            onChange={handleChange}
                            sx={inputStyle}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{
                                                color: "#64748B",
                                                fontSize: 20
                                            }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="Adresse"
                            name="adresse"
                            value={formulaire.adresse}
                            onChange={handleChange}
                            sx={inputStyle}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Home sx={{
                                                color: "#64748B",
                                                fontSize: 20
                                            }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </DialogContent>

                    <DialogActions sx={{
                        backgroundColor: "#111827",
                        borderTop: "1px solid rgba(148,163,184,0.10)",
                        px: 3,
                        py: 2,
                        gap: 1
                    }}>
                        <Button
                            onClick={fermerFormulaire}
                            disabled={loadingForm}
                            variant="outlined"
                            sx={{
                                minWidth: 110,
                                height: 40,
                                borderRadius: 2,
                                color: "#CBD5E1",
                                borderColor: "#374151",
                                textTransform: "none",
                                "&:hover": {
                                    borderColor: "#64748B"
                                }
                            }}
                        >
                            Annuler
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loadingForm}
                            startIcon={
                                !loadingForm &&
                                (fournisseurAModifier ? <FaEdit /> : <FaPlus />)
                            }
                            sx={{
                                minWidth: 165,
                                height: 40,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
                                "&:hover": {
                                    background: "linear-gradient(135deg,#6D28D9,#4338CA)"
                                }
                            }}
                        >
                            {loadingForm
                                ? "Enregistrement..."
                                : fournisseurAModifier
                                    ? "Enregistrer les modifications"
                                    : "Ajouter le fournisseur"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={openDelete}
                onClose={fermerSuppression}
                maxWidth="xs"
                fullWidth
                {...dialogProps}
            >
                <DialogTitle sx={{ color: "white" }}>
                    Supprimer le fournisseur
                </DialogTitle>

                <Box sx={{ px: 3, pb: 2 }}>
                    <Typography sx={{ color: "#CBD5E1" }}>
                        Voulez-vous vraiment supprimer{" "}
                        <strong style={{ color: "white" }}>
                            {fournisseurASupprimer?.nom}
                        </strong>
                        {" ?"}
                    </Typography>
                </Box>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={fermerSuppression}
                        sx={{
                            color: "#94A3B8",
                            textTransform: "none"
                        }}
                    >
                        Annuler
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={supprimerFournisseurConfirm}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2
                        }}
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FournisseurList;