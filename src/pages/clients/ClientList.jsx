import { useEffect, useState } from "react";
import { getClients, createClient, updateClient, deleteClient } from "../../services/clientService";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Stack, Pagination, Dialog, DialogActions,
    DialogContent, DialogTitle, Button, TextField, Box, Typography, InputAdornment
} from "@mui/material";
import { Person, Phone, Email, Home } from "@mui/icons-material";

function ClientList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [page, setPage] = useState(1);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [clientASupprimer, setClientASupprimer] = useState(null);
    const [clientAModifier, setClientAModifier] = useState(null);
    const [loadingForm, setLoadingForm] = useState(false);
    const [erreur, setErreur] = useState("");
    const itemsPerPage = 4;

    const [formulaire, setFormulaire] = useState({
        nom: "", prenom: "", telephone: "", email: "", adresse: ""
    });

    useEffect(() => {
        const chargerClients = async () => {
            try {
                const data = await getClients();
                setClients(data || []);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                toast.error("Impossible de charger les clients.");
            } finally {
                setLoading(false);
            }
        };
        chargerClients();
    }, []);

    const handleChange = (e) => {
        setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
    };

    const resetFormulaire = () => {
        setFormulaire({ nom: "", prenom: "", telephone: "", email: "", adresse: "" });
        setErreur("");
        setClientAModifier(null);
    };

    const ouvrirAjout = () => {
        resetFormulaire();
        setOpenForm(true);
    };

    const ouvrirModification = (client) => {
        setErreur("");
        setClientAModifier(client);
        setFormulaire({
            nom: client.nom || "",
            prenom: client.prenom || "",
            telephone: client.telephone || "",
            email: client.email || "",
            adresse: client.adresse || ""
        });
        setOpenForm(true);
    };

    const fermerFormulaire = () => {
        if (loadingForm) return;
        setOpenForm(false);
        resetFormulaire();
    };

    const enregistrerClient = async (e) => {
        e.preventDefault();
        setErreur("");
        setLoadingForm(true);

        try {
            if (clientAModifier) {
                const clientModifie = await updateClient(clientAModifier.id, formulaire);
                setClients(prev => prev.map(client => client.id === clientAModifier.id ? clientModifie : client));
                toast.success("Client modifié avec succès !");
            } else {
                const nouveauClient = await createClient(formulaire);
                setClients(prev => [nouveauClient, ...prev]);
                setPage(1);
                toast.success("Client ajouté avec succès !");
            }
            setOpenForm(false);
            resetFormulaire();
        } catch (error) {
            console.error("Erreur :", error);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const premierErreur = errors ? Object.values(errors)[0]?.[0] : null;
                setErreur(premierErreur || error.response.data.message || "Veuillez vérifier les informations saisies.");
            } else {
                setErreur(error.response?.data?.message || "Une erreur est survenue.");
            }
        } finally {
            setLoadingForm(false);
        }
    };

    const ouvrirSuppression = (client) => {
        setClientASupprimer(client);
        setOpenDelete(true);
    };

    const fermerSuppression = () => {
        setOpenDelete(false);
        setClientASupprimer(null);
    };

    const supprimerClientConfirm = async () => {
        if (!clientASupprimer) return;

        try {
            await deleteClient(clientASupprimer.id);
            setClients(prev => prev.filter(client => client.id !== clientASupprimer.id));
            toast.success("Client supprimé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            toast.error("Impossible de supprimer le client.");
        } finally {
            fermerSuppression();
        }
    };

    const clientsFiltres = clients.filter(client => {
        const texte = `${client.nom || ""} ${client.prenom || ""} ${client.telephone || ""} ${client.email || ""}`;
        return texte.toLowerCase().includes(recherche.toLowerCase());
    });

    const totalPages = Math.ceil(clientsFiltres.length / itemsPerPage);
    const clientsPage = clientsFiltres.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const inputStyle = {
        mb: 1.4,
        "& .MuiInputLabel-root": { color: "#94A3B8", fontSize: 13 },
        "& .MuiInputLabel-root.Mui-focused": { color: "#A78BFA" },
        "& .MuiOutlinedInput-root": {
            height: 43, color: "white", backgroundColor: "#0B1120",
            borderRadius: 2, fontSize: 13,
            "& fieldset": { borderColor: "#374151" },
            "&:hover fieldset": { borderColor: "#7C3AED" },
            "&.Mui-focused fieldset": { borderColor: "#7C3AED" }
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
        return <Box sx={{ color: "#94A3B8", p: 3 }}>Chargement des clients...</Box>;
    }

    return (
        <Box sx={{ p: 2, color: "white" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>Clients</Typography>
                    <Typography sx={{ color: "#94A3B8", fontSize: 14 }}>{clients.length} clients enregistrés</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher un client..."
                        value={recherche}
                        onChange={e => { setRecherche(e.target.value); setPage(1); }}
                        sx={{
                            width: 240,
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#111827", color: "#94A3B8", borderRadius: 2,
                                "& fieldset": { borderColor: "#374151" },
                                "&:hover fieldset": { borderColor: "#7C3AED" }
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={ouvrirAjout}
                        sx={{
                            height: 40, backgroundColor: "#7C3AED",
                            textTransform: "none", borderRadius: 2, fontWeight: 600,
                            "&:hover": { backgroundColor: "#6D28D9" }
                        }}
                    >
                        Ajouter un client
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: "#111827", borderRadius: 2, overflow: "hidden", border: "1px solid #1F2937" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#111827" }}>
                        <TableRow>
                            {["Nom complet", "Téléphone", "Email", "Adresse", "Total Achat", "Total Dette", "Actions"].map((title, index) => (
                                <TableCell key={title} align={index === 6 ? "center" : "left"} sx={{ color: "#94A3B8" }}>{title}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "#0c101a" }}>
                        {clientsPage.map(client => (
                            <TableRow key={client.id}>
                                <TableCell sx={{ color: "white" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <Box sx={{
                                            width: 42, height: 42, borderRadius: "50%",
                                            backgroundColor: "#312E81", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            color: "#C4B5FD", fontWeight: 700
                                        }}>
                                            {client.nom?.charAt(0).toUpperCase()}
                                            {client.prenom?.charAt(0).toUpperCase()}
                                        </Box>

                                        <Box>
                                            <Typography sx={{ color: "white", fontWeight: 600 }}>
                                                {client.nom_complet || `${client.nom || ""} ${client.prenom || ""}`}
                                            </Typography>
                                            <Typography sx={{ color: "#64748B", fontSize: 12 }}>Client</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ color: "white" }}>{client.telephone}</TableCell>
                                <TableCell sx={{ color: "#94A3B8" }}>{client.email || "-"}</TableCell>
                                <TableCell sx={{ color: "#94A3B8" }}>{client.adresse || "-"}</TableCell>
                                <TableCell sx={{ color: "#10B981", fontWeight: 600 }}>{client.total_achat ?? 0} F</TableCell>
                                <TableCell sx={{ color: "#EF4444", fontWeight: 600 }}>{client.total_dette ?? 0} F</TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Modifier">
                                        <IconButton sx={{ color: "#60A5FA" }} onClick={() => ouvrirModification(client)}>
                                            <FaEdit />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Supprimer">
                                        <IconButton sx={{ color: "#EF4444" }} onClick={() => ouvrirSuppression(client)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}

                        {clientsPage.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ color: "#64748B", py: 5 }}>
                                    Aucun client trouvé.
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
                        "& .MuiPaginationItem-root": { color: "#94A3B8", borderColor: "#374151" },
                        "& .MuiPaginationItem-root.Mui-selected": {
                            backgroundColor: "#7C3AED", color: "white", borderColor: "#7C3AED",
                            "&:hover": { backgroundColor: "#6D28D9" }
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
                <Box component="form" onSubmit={enregistrerClient}>
                    <DialogTitle sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid rgba(148,163,184,0.10)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.7 }}>
                            <Box sx={{
                                width: 46, height: 46, borderRadius: "12px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)"
                            }}>
                                <Person sx={{ color: "white", fontSize: 26 }} />
                            </Box>

                            <Box>
                                <Typography sx={{ color: "white", fontWeight: 700, fontSize: 19 }}>
                                    {clientAModifier ? "Modifier le client" : "Ajouter un client"}
                                </Typography>
                                <Typography sx={{ color: "#94A3B8", fontSize: 12 }}>
                                    {clientAModifier ? "Modifiez les informations du client" : "Enregistrez un nouveau client dans votre boutique"}
                                </Typography>
                            </Box>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{ backgroundColor: "#111827", px: 3, pt: "24px !important", pb: 1 }}>
                        {erreur && (
                            <Box sx={{
                                mb: 2, px: 2, py: 1.2, borderRadius: 2,
                                backgroundColor: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.25)"
                            }}>
                                <Typography sx={{ color: "#F87171", fontSize: 13 }}>{erreur}</Typography>
                            </Box>
                        )}

                        <Typography sx={{ color: "#CBD5E1", fontWeight: 600, fontSize: 13, mb: 1.5 }}>
                            Informations personnelles
                        </Typography>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                            <TextField
                                fullWidth size="small" label="Nom" name="nom"
                                value={formulaire.nom} onChange={handleChange} required sx={inputStyle}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                            />

                            <TextField
                                fullWidth size="small" label="Prénom" name="prenom"
                                value={formulaire.prenom} onChange={handleChange} required sx={inputStyle}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                            />
                        </Box>

                        <TextField
                            fullWidth size="small" label="Téléphone" name="telephone"
                            value={formulaire.telephone} onChange={handleChange} required sx={inputStyle}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                        />

                        <TextField
                            fullWidth size="small" label="Adresse email" name="email" type="email"
                            value={formulaire.email} onChange={handleChange} sx={inputStyle}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                        />

                        <TextField
                            fullWidth size="small" label="Adresse" name="adresse"
                            value={formulaire.adresse} onChange={handleChange} sx={inputStyle}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Home sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                        />
                    </DialogContent>

                    <DialogActions sx={{ backgroundColor: "#111827", borderTop: "1px solid rgba(148,163,184,0.10)", px: 3, py: 2, gap: 1 }}>
                        <Button
                            onClick={fermerFormulaire}
                            disabled={loadingForm}
                            variant="outlined"
                            sx={{
                                minWidth: 110, height: 40, borderRadius: 2,
                                color: "#CBD5E1", borderColor: "#374151",
                                textTransform: "none",
                                "&:hover": { borderColor: "#64748B" }
                            }}
                        >
                            Annuler
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loadingForm}
                            startIcon={!loadingForm && (clientAModifier ? <FaEdit /> : <FaPlus />)}
                            sx={{
                                minWidth: 165, height: 40, borderRadius: 2,
                                textTransform: "none", fontWeight: 600,
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
                                "&:hover": { background: "linear-gradient(135deg,#6D28D9,#4338CA)" }
                            }}
                        >
                            {loadingForm ? "Enregistrement..." : clientAModifier ? "Enregistrer les modifications" : "Ajouter le client"}
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
                <DialogTitle sx={{ color: "white" }}>Supprimer le client</DialogTitle>

                <Box sx={{ px: 3, pb: 2 }}>
                    <Typography sx={{ color: "#CBD5E1" }}>
                        Voulez-vous vraiment supprimer <strong style={{ color: "white" }}>{clientASupprimer?.nom_complet}</strong> ?
                    </Typography>
                </Box>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={fermerSuppression} sx={{ color: "#94A3B8", textTransform: "none" }}>
                        Annuler
                    </Button>

                    <Button color="error" variant="contained" onClick={supprimerClientConfirm} sx={{ textTransform: "none", borderRadius: 2 }}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ClientList;

