import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getVentes, annulerVente, validerVente, payerVente } from "../../services/venteService";
import { FaEye, FaTrash, FaFileInvoice } from "react-icons/fa";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Grid
} from "@mui/material";

function VenteList() {
  const [dialog, setDialog] = useState({ open: false, type: null, vente: null });
  const [paiementForm, setPaiementForm] = useState({
    montant: "",
    mode: "especes",
    date_paiement: new Date().toISOString().split("T")[0],
    reference: ""
  });

  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("Toutes");
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;
  const navigate = useNavigate();

  const rechargerVentes = async () => {
    try {
      const data = await getVentes();
      setVentes(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getVentes()
      .then((data) => {
        if (isMounted) setVentes(data || []);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const annulerVenteHandler = async (id) => {
    try {
      await annulerVente(id);
      toast.success("Vente annulée avec succès !");
      await rechargerVentes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const validerVenteHandler = async (id) => {
    try {
      await validerVente(id);
      toast.success("Vente validée avec succès !");
      await rechargerVentes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const payerVenteHandler = async () => {
    const { montant, mode, date_paiement, reference } = paiementForm;

    if (!montant || Number(montant) <= 0) {
      toast.error("Veuillez saisir un montant valide.");
      return;
    }

    const resteAPayer = Number(dialog.vente?.reste_a_payer || 0);
    if (Number(montant) > resteAPayer) {
      toast.error(`Le montant dépasse le reste à payer (${resteAPayer.toLocaleString()} F).`);
      return;
    }

    try {
      await payerVente({
        vente_id: dialog.vente.id,
        montant: Number(montant),
        mode,
        date_paiement,
        reference: reference.trim() || null
      });

      toast.success("Paiement enregistré avec succès !");
      handleCloseDialog();
      await rechargerVentes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du paiement");
    }
  };

  const handleOpenPaiementDialog = (vente) => {
    const reste = Number(vente.reste_a_payer || 0);
    setPaiementForm({
      montant: reste > 0 ? reste : "",
      mode: "especes",
      date_paiement: new Date().toISOString().split("T")[0],
      reference: ""
    });
    setDialog({ open: true, type: "payer", vente });
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, type: null, vente: null });
    setPaiementForm({
      montant: "",
      mode: "especes",
      date_paiement: new Date().toISOString().split("T")[0],
      reference: ""
    });
  };

  const handleConfirmAction = () => {
    if (dialog.type === "annuler") {
      annulerVenteHandler(dialog.vente.id);
      handleCloseDialog();
    } else if (dialog.type === "valider") {
      validerVenteHandler(dialog.vente.id);
      handleCloseDialog();
    } else if (dialog.type === "payer") {
      payerVenteHandler();
    }
  };

  const ventesFiltrees = ventes.filter((vente) => {
    const clientNom = vente.client ? `${vente.client.nom} ${vente.client.prenom}` : "Client passage";
    const rechercheOk = `${clientNom} ${vente.montant_total}`
      .toLowerCase()
      .includes(recherche.toLowerCase());

    const isEnAttente = vente.statut === "en_attente" || vente.statut === "En attente";
    const isValidee = vente.statut === "validee" || vente.statut === "Validée" || vente.statut === "Payé" || vente.statut === "Terminée";
    const isAnnulee = vente.statut === "annulee" || vente.statut === "Annulé";
    const isNonPayee = Number(vente.reste_a_payer || 0) > 0 && !isAnnulee;

    let statutOk = true;
    if (filtreStatut === "en_attente") statutOk = isEnAttente;
    else if (filtreStatut === "validees") statutOk = isValidee;
    else if (filtreStatut === "non_payees") statutOk = isNonPayee;
    else if (filtreStatut === "annulees") statutOk = isAnnulee;

    return rechercheOk && statutOk;
  });

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "20%" }}>
        Chargement des ventes...
      </div>
    );
  }

  const totalPages = Math.ceil(ventesFiltrees.length / itemsPerPage);
  const handlePageChange = (event, value) => setPage(value);

  const total = ventes.length;
  const nbEnAttente = ventes.filter((v) => v.statut === "en_attente" || v.statut === "En attente").length;
  const nbValidees = ventes.filter((v) => v.statut === "validee" || v.statut === "Validée" || v.statut === "Payé" || v.statut === "Terminée").length;
  const nbAnnulees = ventes.filter((v) => v.statut === "annulee" || v.statut === "Annulé").length;
  const nbNonPayees = ventes.filter((v) => Number(v.reste_a_payer || 0) > 0 && v.statut !== "annulee" && v.statut !== "Annulé").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <h2 style={{ color: "white", marginLeft: "10px", marginBottom: "20px" }}>Ventes</h2>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1px", marginTop: "2px" }}>
          <button 
            onClick={() => { setFiltreStatut("Toutes"); setPage(1); }} 
            style={{ backgroundColor: filtreStatut === "Toutes" ? "#7C3AED" : "#111827", margin: "5px", color: "white", border: "1px solid #7C3AED", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Toutes({total})
          </button>
          <button 
            onClick={() => { setFiltreStatut("en_attente"); setPage(1); }} 
            style={{ backgroundColor: filtreStatut === "en_attente" ? "#f6f60a" : "#111827", margin: "5px", color: filtreStatut === "en_attente" ? "black" : "#f6f60a", border: "1px solid #f6f60a", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            En attente({nbEnAttente})
          </button>
          <button 
            onClick={() => { setFiltreStatut("validees"); setPage(1); }} 
            style={{ backgroundColor: filtreStatut === "validees" ? "#10B981" : "#111827", margin: "5px", color: filtreStatut === "validees" ? "white" : "#10B981", border: "1px solid #10B981", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Validées({nbValidees})
          </button>
          <button 
            onClick={() => { setFiltreStatut("non_payees"); setPage(1); }} 
            style={{ backgroundColor: filtreStatut === "non_payees" ? "#F59E0B" : "#111827", margin: "5px", color: filtreStatut === "non_payees" ? "white" : "#F59E0B", border: "1px solid #F59E0B", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Non payées({nbNonPayees})
          </button>
          <button 
            onClick={() => { setFiltreStatut("annulees"); setPage(1); }} 
            style={{ backgroundColor: filtreStatut === "annulees" ? "#EF4444" : "#111827", margin: "5px", color: filtreStatut === "annulees" ? "white" : "#EF4444", border: "1px solid #EF4444", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Annulées({nbAnnulees})
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Rechercher ..."
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            style={{ backgroundColor: "#111827", color: "#94A3B8", border: "1px solid #94A3B8", padding: "5px", borderRadius: "10px" }}
          />
          <button onClick={() => navigate("/ventes/new")} style={{ backgroundColor: "#7C3AED", color: "white", border: "none", padding: "5px 10px", marginLeft: "20px", borderRadius: "10px", cursor: "pointer", marginRight: "20px" }}>
            + Nouvelle vente
          </button>
        </div>
      </div>

      {/* MODALE DIALOGUE */}
      <Dialog open={dialog.open} onClose={handleCloseDialog} fullWidth maxWidth="sm" disableRestoreFocus>
        <DialogTitle>
          {dialog.type === "annuler" && "Annulation de la vente"}
          {dialog.type === "valider" && "Validation de la vente"}
          {dialog.type === "payer" && `Enregistrer un paiement (#V-${dialog.vente?.id})`}
        </DialogTitle>
        <DialogContent>
          {dialog.type === "annuler" && (
            <DialogContentText>Voulez-vous vraiment annuler cette vente ?</DialogContentText>
          )}
          {dialog.type === "valider" && (
            <DialogContentText>Voulez-vous vraiment valider cette vente ?</DialogContentText>
          )}

          {dialog.type === "payer" && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Montant réglé (FCFA)"
                  value={paiementForm.montant}
                  onChange={(e) => setPaiementForm({ ...paiementForm, montant: e.target.value })}
                  helperText={`Reste à payer : ${Number(dialog.vente?.reste_a_payer || 0).toLocaleString()} F`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Mode de paiement"
                  value={paiementForm.mode}
                  onChange={(e) => setPaiementForm({ ...paiementForm, mode: e.target.value })}
                >
                  <MenuItem value="especes">Espèces</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="carte">Carte Bancaire</MenuItem>
                  <MenuItem value="virement">Virement</MenuItem>
                  <MenuItem value="cheque">Chèque</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de règlement"
                  InputLabelProps={{ shrink: true }}
                  value={paiementForm.date_paiement}
                  onChange={(e) => setPaiementForm({ ...paiementForm, date_paiement: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Référence / N° Trans (optionnel)"
                  placeholder="Ex: N° Chèque, Trans. Orange Money..."
                  value={paiementForm.reference}
                  onChange={(e) => setPaiementForm({ ...paiementForm, reference: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Annuler</Button>
          <Button onClick={handleConfirmAction} color="primary" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #262d382e" } }}>
          <TableHead sx={{ backgroundColor: "#111827" }}>
            <TableRow sx={{ "& th": { color: "#94A3B8" } }}>
              <TableCell># VENTE</TableCell>
              <TableCell>CLIENT</TableCell>
              <TableCell>DATE</TableCell>
              <TableCell>ARTICLES</TableCell>
              <TableCell>MONTANT TOTAL</TableCell>
              <TableCell>RESTE À PAYER</TableCell>
              <TableCell>STATUT</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ backgroundColor: "#0c101a" }}>
            {ventesFiltrees.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((vente) => {
              const isAnnule = vente.statut === "Annulé" || vente.statut === "annulee";
              const isValide = vente.statut === "validee" || vente.statut === "Validée" || vente.statut === "Payé" || vente.statut === "Terminée";
              const resteAPayer = Number(vente.reste_a_payer || 0);

              return (
                <TableRow key={vente.id}>
                  <TableCell sx={{ color: "white" }}>#V-{vente.id}</TableCell>
                  <TableCell sx={{ color: "#94A3B8" }}>
                    <span style={{ backgroundColor: "#0d214c", width: 45, height: 45, fontWeight: "bold", display: "inline-block", textAlign: "center", lineHeight: "45px", color: "#94A3B8", borderRadius: "10px", marginRight: "10px" }}>
                      {vente.client?.nom?.charAt(0).toUpperCase() || 'C'}
                    </span>
                    <div style={{ display: "inline-block", verticalAlign: "middle", color: "#94A3B8" }}>
                      <span>{vente.client ? `${vente.client.nom} ${vente.client.prenom}` : 'Client Ordinaire'}</span>
                      <br />
                      <span style={{ color: "#32373e" }}>{vente.client?.telephone || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell sx={{ color: "#94A3B8" }}>{vente.date_vente}</TableCell>
                  <TableCell sx={{ color: "#94A3B8" }}>{vente.lignes?.length || 0} réf</TableCell>
                  <TableCell sx={{ color: "#94A3B8" }}>{Number(vente.montant_total).toLocaleString()} F</TableCell>
                  <TableCell sx={{ color: resteAPayer > 0 ? "#EF4444" : "#10B981" }}>
                    {resteAPayer.toLocaleString()} F
                  </TableCell>
                  <TableCell>
                    <div style={{ height: "30px", color: isAnnule ? "#EF4444" : resteAPayer > 0 ? "#f6f60a" : "#10B981", borderRadius: "10px", backgroundColor: isAnnule ? "#EF44441a" : resteAPayer > 0 ? "#f6f60a1a" : "#10B9811a", textAlign: "center", alignItems: "center", display: "flex", justifyContent: "center", padding: "0 10px" }}>
                      {vente.statut}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                      {!isAnnule && !isValide && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setDialog({ open: true, type: "valider", vente })}
                          sx={{
                            backgroundColor: "#10B981",
                            color: "white",
                            fontSize: "11px",
                            textTransform: "none",
                            padding: "2px 8px",
                            minWidth: "auto",
                            "&:hover": { backgroundColor: "#059669" },
                          }}
                        >
                          Valider
                        </Button>
                      )}

                      {!isAnnule && resteAPayer > 0 && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenPaiementDialog(vente)}
                          sx={{
                            backgroundColor: "#F59E0B",
                            color: "white",
                            fontSize: "11px",
                            textTransform: "none",
                            padding: "2px 8px",
                            minWidth: "auto",
                            "&:hover": { backgroundColor: "#D97706" },
                          }}
                        >
                          Payer
                        </Button>
                      )}

                    <Tooltip title="Voir la facture">
                        <IconButton size="small" sx={{ color: "#A78BFA" }} onClick={() => navigate(`/factures/${vente.id}`)}>
                            <FaFileInvoice />
                        </IconButton>
                    </Tooltip>

                      <Tooltip title="Voir les détails">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/ventes/${vente.id}`)}>
                          <FaEye />
                        </IconButton>
                      </Tooltip>

                      {!isAnnule && !isValide && (
                        <Tooltip title="Annuler la vente">
                          <IconButton size="small" color="error" onClick={() => setDialog({ open: true, type: "annuler", vente })}>
                            <FaTrash />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={2}>
        <Pagination
          count={totalPages || 1}
          page={page}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": { color: "#94A3B8", borderColor: "#374151" },
            "& .MuiPaginationItem-root.Mui-selected": { backgroundColor: "#7C3AED", color: "white", borderColor: "#7C3AED", "&:hover": { backgroundColor: "#6D28D9" } },
          }}
        />
      </Stack>
    </div>
  );
}

export default VenteList;