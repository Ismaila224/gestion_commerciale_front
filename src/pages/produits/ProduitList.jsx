import { useEffect, useState } from "react";
import { 
    getProduits, 
    createProduit, 
    updateProduit, 
    deleteProduit 
} from "../../services/produitService";
import { getCategories } from "../../services/categorieService";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Stack, Pagination, Dialog, DialogActions,
    DialogContent, DialogTitle, Button, TextField, Box, Typography, InputAdornment,
    MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { 
    ShoppingBag, 
    Category, 
    AttachMoney, 
    Description, 
    Inventory, 
    QrCode 
} from "@mui/icons-material";

function ProduitList() {
    const [produits, setProduits] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [page, setPage] = useState(1);
    
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [produitASupprimer, setProduitASupprimer] = useState(null);
    const [produitAModifier, setProduitAModifier] = useState(null);
    const [loadingForm, setLoadingForm] = useState(false);
    const [erreur, setErreur] = useState("");
    
    const itemsPerPage = 4;

    const [formulaire, setFormulaire] = useState({
        nom: "",
        reference: "",
        categorie_id: "",
        prix_achat: "",
        prix_vente: "",
        stock_min: "",
        description: ""
    });

    useEffect(() => {
        const chargerDonnees = async () => {
            try {
                const [produitsData, categoriesData] = await Promise.all([
                    getProduits(),
                    getCategories()
                ]);
                setProduits(produitsData || []);
                setCategories(categoriesData || []);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                toast.error("Impossible de charger les données.");
            } finally {
                setLoading(false);
            }
        };
        chargerDonnees();
    }, []);

    const handleChange = (e) => {
        setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
    };

    const resetFormulaire = () => {
        setFormulaire({
            nom: "", reference: "", categorie_id: "",
            prix_achat: "", prix_vente: "", stock_min: "", description: ""
        });
        setErreur("");
        setProduitAModifier(null);
    };

    const ouvrirAjout = () => {
        resetFormulaire();
        setOpenForm(true);
    };

    const ouvrirModification = (produit) => {
        setErreur("");
        setProduitAModifier(produit);
        setFormulaire({
            nom: produit.nom || "",
            reference: produit.reference || "",
            categorie_id: produit.categorie_id || produit.categorie?.id || "",
            prix_achat: produit.prix_achat ?? "",
            prix_vente: produit.prix_vente ?? "",
            stock_min: produit.stock_min ?? produit.stock_minimum ?? 0,
            description: produit.description || ""
        });
        setOpenForm(true);
    };

    const fermerFormulaire = () => {
        if (loadingForm) return;
        setOpenForm(false);
        resetFormulaire();
    };

    const enregistrerProduit = async (e) => {
        e.preventDefault();
        setErreur("");
        setLoadingForm(true);

        try {
            if (produitAModifier) {
                const produitModifie = await updateProduit(produitAModifier.id, formulaire);
                setProduits(prev => prev.map(p => p.id === produitAModifier.id ? produitModifie : p));
                toast.success("Produit modifié avec succès !");
            } else {
                const nouveauProduit = await createProduit(formulaire);
                setProduits(prev => [nouveauProduit, ...prev]);
                setPage(1);
                toast.success("Produit ajouté avec succès !");
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

    const ouvrirSuppression = (produit) => {
        setProduitASupprimer(produit);
        setOpenDelete(true);
    };

    const fermerSuppression = () => {
        setOpenDelete(false);
        setProduitASupprimer(null);
    };

    const supprimerProduitConfirm = async () => {
        if (!produitASupprimer) return;

        try {
            await deleteProduit(produitASupprimer.id);
            setProduits(prev => prev.filter(p => p.id !== produitASupprimer.id));
            toast.success("Produit supprimé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            toast.error("Impossible de supprimer le produit.");
        } finally {
            fermerSuppression();
        }
    };

    const produitsFiltres = produits.filter(p => {
        const texte = `${p.nom || ""} ${p.reference || ""} ${p.categorie?.nom || ""} ${p.prix_vente || ""}`;
        return texte.toLowerCase().includes(recherche.toLowerCase());
    });

    const totalPages = Math.ceil(produitsFiltres.length / itemsPerPage);
    const produitsPage = produitsFiltres.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const inputStyle = {
        mb: 1.4,
        "& .MuiInputLabel-root": { color: "#94A3B8", fontSize: 13 },
        "& .MuiInputLabel-root.Mui-focused": { color: "#A78BFA" },
        "& .MuiOutlinedInput-root": {
            color: "white", backgroundColor: "#0B1120",
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
        return <Box sx={{ color: "#94A3B8", p: 3 }}>Chargement des produits...</Box>;
    }

    return (
        <Box sx={{ p: 2, color: "white" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>Produits</Typography>
                    <Typography sx={{ color: "#94A3B8", fontSize: 14 }}>{produits.length} produits enregistrés</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher un produit..."
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
                        Ajouter un produit
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: "#111827", borderRadius: 2, overflow: "hidden", border: "1px solid #1F2937" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#111827" }}>
                        <TableRow>
                            {["Nom", "Catégorie", "Prix d'achat", "Prix de vente", "Description", "Stock actuel", "Actions"].map((title, index) => (
                                <TableCell key={title} align={index === 6 ? "center" : "left"} sx={{ color: "#94A3B8" }}>{title}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "#0c101a" }}>
                        {produitsPage.map(produit => (
                            <TableRow key={produit.id}>
                                <TableCell sx={{ color: "white" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <Box sx={{
                                            width: 42, height: 42, borderRadius: "10px",
                                            backgroundColor: "#312E81", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            color: "#C4B5FD", fontWeight: 700
                                        }}>
                                            {produit.nom?.charAt(0).toUpperCase()}
                                        </Box>

                                        <Box>
                                            <Typography sx={{ color: "white", fontWeight: 600 }}>
                                                {produit.nom}
                                            </Typography>
                                            <Typography sx={{ color: "#64748B", fontSize: 12 }}>
                                                {produit.reference || "-"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ color: "#94A3B8" }}>{produit.categorie?.nom || "-"}</TableCell>
                                <TableCell sx={{ color: "#64748B" }}>{produit.prix_achat} F</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 600 }}>{produit.prix_vente} F</TableCell>
                                <TableCell sx={{ color: "#94A3B8" }}>{produit.description || "-"}</TableCell>

                                <TableCell>
                                    <Box sx={{
                                        height: 30, px: 1.5, display: "inline-flex",
                                        alignItems: "center", justifyContent: "center",
                                        borderRadius: "6px", fontSize: 13, fontWeight: 600,
                                        color: (produit.stock_actuel ?? 0) < (produit.stock_min ?? produit.stock_minimum ?? 0) ? "#EF4444" : "#10B981",
                                        backgroundColor: (produit.stock_actuel ?? 0) < (produit.stock_min ?? produit.stock_minimum ?? 0) ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                        border: `1px solid ${(produit.stock_actuel ?? 0) < (produit.stock_min ?? produit.stock_minimum ?? 0) ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
                                    }}>
                                        {produit.stock_actuel ?? 0} / {produit.stock_min ?? produit.stock_minimum ?? 0}
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Modifier">
                                        <IconButton sx={{ color: "#60A5FA" }} onClick={() => ouvrirModification(produit)}>
                                            <FaEdit />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Supprimer">
                                        <IconButton sx={{ color: "#EF4444" }} onClick={() => ouvrirSuppression(produit)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}

                        {produitsPage.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ color: "#64748B", py: 5 }}>
                                    Aucun produit trouvé.
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

            {/* Modal Formulaire */}
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
                <Box component="form" onSubmit={enregistrerProduit}>
                    <DialogTitle sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid rgba(148,163,184,0.10)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.7 }}>
                            <Box sx={{
                                width: 46, height: 46, borderRadius: "12px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)"
                            }}>
                                <ShoppingBag sx={{ color: "white", fontSize: 26 }} />
                            </Box>

                            <Box>
                                <Typography sx={{ color: "white", fontWeight: 700, fontSize: 19 }}>
                                    {produitAModifier ? "Modifier le produit" : "Ajouter un produit"}
                                </Typography>
                                <Typography sx={{ color: "#94A3B8", fontSize: 12 }}>
                                    {produitAModifier ? "Modifiez les informations du produit" : "Enregistrez un nouveau produit dans votre catalogue"}
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

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                            <TextField
                                fullWidth size="small" label="Nom du produit" name="nom"
                                value={formulaire.nom} onChange={handleChange} required sx={inputStyle}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><ShoppingBag sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                            />

                            <TextField
                                fullWidth size="small" label="Référence" name="reference"
                                value={formulaire.reference} onChange={handleChange} required sx={inputStyle}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><QrCode sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                            />
                        </Box>

                        <FormControl fullWidth size="small" sx={{ ...inputStyle, mb: 1.4 }}>
                            <InputLabel id="label-cat" sx={{ color: "#94A3B8", fontSize: 13 }}>Catégorie</InputLabel>
                            <Select
                                labelId="label-cat"
                                label="Catégorie"
                                name="categorie_id"
                                value={formulaire.categorie_id}
                                onChange={handleChange}
                                required
                                startAdornment={<InputAdornment position="start"><Category sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment>}
                                sx={{ color: "white" }}
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.nom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                            <TextField
                                fullWidth size="small" label="Prix d'achat" name="prix_achat" type="number"
                                value={formulaire.prix_achat} onChange={handleChange} required sx={inputStyle}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><AttachMoney sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                            />

                            <TextField
                                fullWidth size="small" label="Prix de vente" name="prix_vente" type="number"
                                value={formulaire.prix_vente} onChange={handleChange} required sx={inputStyle}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><AttachMoney sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                            />
                        </Box>

                        <TextField
                            fullWidth size="small" label="Stock minimum alerte" name="stock_min" type="number"
                            value={formulaire.stock_min} onChange={handleChange} required sx={inputStyle}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Inventory sx={{ color: "#64748B", fontSize: 20 }} /></InputAdornment> } }}
                        />

                        <TextField
                            fullWidth multiline rows={2} label="Description" name="description"
                            value={formulaire.description} onChange={handleChange} sx={inputStyle}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Description sx={{ color: "#64748B", fontSize: 20, mt: 1 }} /></InputAdornment> } }}
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
                            startIcon={!loadingForm && (produitAModifier ? <FaEdit /> : <FaPlus />)}
                            sx={{
                                minWidth: 165, height: 40, borderRadius: 2,
                                textTransform: "none", fontWeight: 600,
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
                                "&:hover": { background: "linear-gradient(135deg,#6D28D9,#4338CA)" }
                            }}
                        >
                            {loadingForm ? "Enregistrement..." : produitAModifier ? "Enregistrer les modifications" : "Ajouter le produit"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Modal Confirmation de Suppression */}
            <Dialog
                open={openDelete}
                onClose={fermerSuppression}
                maxWidth="xs"
                fullWidth
                {...dialogProps}
            >
                <DialogTitle sx={{ color: "white" }}>Supprimer le produit</DialogTitle>

                <Box sx={{ px: 3, pb: 2 }}>
                    <Typography sx={{ color: "#CBD5E1" }}>
                        Voulez-vous vraiment supprimer <strong style={{ color: "white" }}>{produitASupprimer?.nom}</strong> ?
                    </Typography>
                </Box>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={fermerSuppression} sx={{ color: "#94A3B8", textTransform: "none" }}>
                        Annuler
                    </Button>

                    <Button color="error" variant="contained" onClick={supprimerProduitConfirm} sx={{ textTransform: "none", borderRadius: 2 }}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProduitList;