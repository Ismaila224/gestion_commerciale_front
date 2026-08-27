import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Stack,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import { getProduits } from "../../services/produitService";
import { getClients } from "../../services/clientService";
import { createVente, getVente } from "../../services/venteService";

function FormVente() {
  const { id } = useParams();
  const isView = !!id;

  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [open, setOpen] = useState(false);

  const [clientId, setClientId] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [dateVente, setDateVente] = useState(new Date().toISOString().split("T")[0]);
  const [lignes, setLignes] = useState([]);
  const [produitSelectionne, setProduitSelectionne] = useState("");

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const clientsData = await getClients();
        const produitsData = await getProduits();
        setClients(clientsData || []);
        setProduits(produitsData || []);
      } catch (e) {
        console.error(e);
      }
    };
    chargerDonnees();
  }, []);

  useEffect(() => {
    if (!isView) return;

    const chargerVenteDetails = async () => {
      try {
        const vente = await getVente(id);
        
        // 1. Récupération robuste du Client
        const idDuClient = vente.client_id || vente.client?.id || "";
        setClientId(idDuClient ? String(idDuClient) : "");
        setClientInfo(vente.client || null);
        
        // 2. Récupération et formatage de la Date (Format YYYY-MM-DD requis pour type="date")
        if (vente.date_vente) {
          const dateFormatee = vente.date_vente.includes("T") 
            ? vente.date_vente.split("T")[0] 
            : vente.date_vente;
          setDateVente(dateFormatee);
        }

        // 3. Formatage robuste des Lignes
        if (vente.lignes && Array.isArray(vente.lignes)) {
          const lignesFormatees = vente.lignes.map((ligne) => {
            const produitObj = ligne.produit || {};
            return {
              id: ligne.id || Date.now() + Math.random(),
              produit: {
                id: produitObj.id || ligne.produit_id,
                nom: produitObj.nom || ligne.nom_produit || "Produit sans nom",
                stock_actuel: produitObj.stock_actuel ?? "N/A",
              },
              quantite: Number(ligne.quantite || 1),
              prix: Number(ligne.prix_unitaire || ligne.prix || 0),
            };
          });

          setLignes(lignesFormatees);
        }
      } catch (e) {
        console.error("Erreur chargement détails vente:", e);
        toast.error("Impossible de charger les détails de cette vente.");
      }
    };

    chargerVenteDetails();
  }, [id, isView]);

  const ajouterArticle = () => {
    if (!produitSelectionne) return;

    const produit = produits.find((p) => p.id == produitSelectionne);
    if (!produit) return;

    if (produit.stock_actuel < 1) {
      toast.error("Impossible d'ajouter le produit : le stock disponible est épuisé !");
      return;
    }

    const existe = lignes.find((l) => l.produit.id === produit.id);
    if (existe) {
      toast.info("Ce produit est déjà dans le panier.");
      return;
    }

    setLignes([
      ...lignes,
      {
        id: Date.now(),
        produit,
        quantite: 1,
        prix: produit.prix_vente || 0,
      },
    ]);

    setProduitSelectionne("");
  };

  const enregistrerVente = async () => {
    if (lignes.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la vente.");
      return;
    }

    const ligneInvalide = lignes.find((l) => l.quantite > l.produit.stock_actuel);
    if (ligneInvalide) {
      toast.error(
        `La quantité pour "${ligneInvalide.produit.nom}" (${ligneInvalide.quantite}) est supérieure au stock (${ligneInvalide.produit.stock_actuel}) !`
      );
      return;
    }

    try {
      const data = {
        client_id: clientId || null,
        date_vente: dateVente,
        lignes: lignes.map((ligne) => ({
          produit_id: ligne.produit.id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix,
        })),
      };

      await createVente(data);
      toast.success("Vente enregistrée avec succès !");
      navigate("/ventes");
    } catch (error) {
      console.error(error.response?.data);
      toast.error(error.response?.data?.message || "Veuillez remplir tous les champs obligatoires !");
    }
  };

  const supprimerLigne = (id) => {
    const nouvellesLignes = lignes.filter((l) => l.id !== id);
    setLignes(nouvellesLignes);
    const maxPages = Math.ceil(nouvellesLignes.length / itemsPerPage) || 1;
    if (page > maxPages) setPage(maxPages);
  };

  const modifierQuantite = (id, valeur) => {
    setLignes(
      lignes.map((l) => {
        if (l.id === id) {
          const nouvelleQuantite = l.quantite + valeur;

          if (valeur > 0 && typeof l.produit.stock_actuel === 'number' && nouvelleQuantite > l.produit.stock_actuel) {
            toast.error(
              `Quantité (${nouvelleQuantite}) supérieure au stock disponible (${l.produit.stock_actuel}) !`
            );
            return l;
          }

          return { ...l, quantite: Math.max(1, nouvelleQuantite) };
        }
        return l;
      })
    );
  };

  const modifierPrix = (id, prix) => {
    setLignes(
      lignes.map((l) => (l.id === id ? { ...l, prix: Number(prix) } : l))
    );
  };

  const nombreArticles = lignes.length;
  const quantiteTotale = lignes.reduce((s, l) => s + Number(l.quantite), 0);
  const sousTotal = lignes.reduce((s, l) => s + (Number(l.quantite) * Number(l.prix)), 0);
  const tva = sousTotal * 0.18;
  const total = sousTotal + tva;

  const totalPages = Math.ceil(lignes.length / itemsPerPage);
  const indexDebut = (page - 1) * itemsPerPage;
  const lignesAffichees = lignes.slice(indexDebut, indexDebut + itemsPerPage);

  const handlePageChange = (event, value) => setPage(value);

  // Libellé texte pour l'affichage du client
  const getNomClientAffiche = () => {
    if (clientInfo) return `${clientInfo.nom} ${clientInfo.prenom} ${clientInfo.telephone ? `- ${clientInfo.telephone}` : ''}`;
    if (clientId) {
      const c = clients.find((item) => String(item.id) === String(clientId));
      if (c) return `${c.nom} ${c.prenom} - ${c.telephone}`;
    }
    return "Client Ordinaire (Passage)";
  };

  return (
    <div style={{ padding: "25px", background: "#000000", minHeight: "90vh", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 15 }}>
          <Button
            startIcon={<FaArrowLeft />}
            onClick={() => navigate("/ventes")}
            variant="contained"
            sx={{ color: "#94A3B8", border: "1px solid #374151", mr: 2 }}
          >
            Retour
          </Button>
          <div>
            <h3 style={{ margin: 0 }}>{isView ? `Détails de la vente #${id}` : "Nouvelle vente"}</h3>
            <span style={{ color: "#94A3B8" }}>{isView ? "Consultation" : "Saisie de vente"}</span>
          </div>
        </div>

        {!isView && (
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => setOpen(true)}
            sx={{
              background: "#7c3aed2c",
              fontSize: 14,
              height: 40,
              color: "#5d3a9aea",
              textTransform: "none",
              borderRadius: 10,
              "&:hover": { background: "#6D28D9", color: "white" },
              marginBottom: 2,
            }}
          >
            Enregistrer la vente
          </Button>
        )}

        <Dialog open={open} onClose={() => setOpen(false)} disableRestoreFocus>
          <DialogTitle>Enregistrement de la vente</DialogTitle>
          <DialogContent>
            <DialogContentText>Voulez-vous vraiment valider cette vente ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Sortir</Button>
            <Button
              onClick={() => {
                enregistrerVente();
                setOpen(false);
              }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20, marginBottom: 20 }}>
        <Paper sx={{ background: "#111827", color: "#94a3b88e", padding: 3, borderRadius: 3 }}>
          <h3>INFORMATIONS</h3>
          <h6 style={{ marginBottom: 5, color: "#94a3b88e" }}>Client</h6>
          
          {/* Si en mode consultation, affichage sous forme de champ en lecture seule fiable */}
          {isView ? (
            <TextField
              fullWidth
              disabled
              value={getNomClientAffiche()}
              margin="normal"
              sx={{
                backgroundColor: "#000000",
                "& .MuiInputBase-input.Mui-disabled": { 
                  WebkitTextFillColor: "#FFFFFF",
                  fontWeight: "bold" 
                },
                borderRadius: 2
              }}
            />
          ) : (
            <TextField
              sx={{ backgroundColor: "#000000", "& .MuiInputBase-input": { color: "#94A3B8" }, borderRadius: 2 }}
              select
              fullWidth
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              margin="normal"
            >
              <MenuItem value="">-- Client Ordinaire (Passage) --</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.nom} {c.prenom} - {c.telephone}
                </MenuItem>
              ))}
            </TextField>
          )}

          <h6 style={{ marginTop: 15, marginBottom: 5, color: "#94a3b88e" }}>Date de la vente</h6>
          <div style={{ display: "flex", gap: 15, marginBottom: 5 }}>
            <TextField
              sx={{
                backgroundColor: "#000000",
                "& .MuiInputBase-input": { color: "#FFFFFF" },
                "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#FFFFFF" },
                "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)", cursor: "pointer" },
                borderRadius: 2,
              }}
              fullWidth
              type="date"
              disabled={isView}
              value={dateVente}
              onChange={(e) => setDateVente(e.target.value)}
            />
          </div>
        </Paper>

        <Paper sx={{ background: "#111827", color: "#94a3b88e", padding: 3, borderRadius: 3 }}>
          <h3>RÉSUMÉ VENTE</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span>Nb articles</span>
            <b style={{ color: "white" }}>{nombreArticles} référence(s)</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span>Quantité totale</span>
            <b style={{ color: "white" }}>{quantiteTotale} unités</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>
            <span>Sous-total HT</span>
            <b style={{ color: "white" }}>{sousTotal.toLocaleString()} F</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span>TVA (18%)</span>
            <b style={{ color: "white" }}>{tva.toLocaleString()} F</b>
          </div>
          <hr style={{ margin: "20px 0", borderColor: "#374151" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#10B981", fontWeight: "bold" }}>
            <span>TOTAL TTC</span>
            <span>{total.toLocaleString()} F</span>
          </div>
        </Paper>
      </div>

      <Paper sx={{ background: "#111827c1", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: 15 }}>
          <h4 style={{ color: "white", margin: 0 }}>PANIER CLIENT</h4>
          {!isView && (
            <div style={{ display: "flex", gap: 10 }}>
              <label htmlFor="produit" style={{ color: "white", marginTop: 10 }}>
                Produit
              </label>
              <TextField
                select
                size="small"
                value={produitSelectionne}
                onChange={(e) => setProduitSelectionne(e.target.value)}
                sx={{ minWidth: 200, backgroundColor: "#000000", "& .MuiInputBase-input": { color: "#94A3B8" }, borderRadius: 2 }}
              >
                {produits.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nom} (Stock: {p.stock_actuel})
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<FaPlus />}
                onClick={ajouterArticle}
                sx={{
                  background: "#7c3aed2c",
                  fontSize: 14,
                  height: 40,
                  color: "#5d3a9aea",
                  textTransform: "none",
                  borderRadius: 10,
                  "&:hover": { background: "#6D28D9", color: "white" },
                }}
              >
                Ajouter au panier
              </Button>
            </div>
          )}
        </div>

        <TableContainer>
          <Table sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #262d382e" } }}>
            <TableHead sx={{ backgroundColor: "#0406099d" }}>
              <TableRow sx={{ "& th": { color: "#94a3b88e" } }}>
                <TableCell>PRODUIT</TableCell>
                <TableCell>STOCK DISPONIBLE</TableCell>
                <TableCell>QTE</TableCell>
                <TableCell>PRIX DE VENTE</TableCell>
                <TableCell>TOTAL LIGNE</TableCell>
                {!isView && <TableCell></TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {lignes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: "#94A3B8" }}>
                    Aucun article dans le panier
                  </TableCell>
                </TableRow>
              ) : (
                lignesAffichees.map((ligne) => (
                  <TableRow key={ligne.id}>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "white" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "10px", background: "#312E81", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontWeight: "bold" }}>
                          {ligne.produit?.nom ? ligne.produit.nom.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{ligne.produit?.nom || "Produit"}</div>
                          <div style={{ color: "#94A3B8", fontSize: 13 }}>Réf : {ligne.produit?.id || "N/A"}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span style={{ 
                        background: typeof ligne.produit?.stock_actuel === 'number' && ligne.produit.stock_actuel < 1 ? "#ef44443b" : "#064e3b8d", 
                        color: typeof ligne.produit?.stock_actuel === 'number' && ligne.produit.stock_actuel < 1 ? "#EF4444" : "#10B981", 
                        padding: "5px 10px", 
                        borderRadius: 8, 
                        fontSize: 13 
                      }}>
                        Stock: {ligne.produit?.stock_actuel ?? "Historique"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#000000", borderRadius: 5, height: 30, color: "white", width: "fit-content", padding: "0 5px" }}>
                        {!isView && (
                          <IconButton sx={{ color: "#7c3aedfb" }} onClick={() => modifierQuantite(ligne.id, -1)}>
                            -
                          </IconButton>
                        )}
                        <b>{ligne.quantite}</b>
                        {!isView && (
                          <IconButton sx={{ color: "#7c3aedfb" }} onClick={() => modifierQuantite(ligne.id, 1)}>
                            +
                          </IconButton>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {isView ? (
                        <span style={{ color: "white", fontWeight: "bold" }}>
                          {Number(ligne.prix).toLocaleString()} F
                        </span>
                      ) : (
                        <TextField
                          sx={{ backgroundColor: "#000000", "& .MuiInputBase-input": { color: "#94A3B8" }, borderRadius: 2 }}
                          size="small"
                          type="number"
                          value={ligne.prix}
                          onChange={(e) => modifierPrix(ligne.id, e.target.value)}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <span style={{ color: "#10B981", fontWeight: "bold" }}>
                        {(ligne.quantite * ligne.prix).toLocaleString()} F
                      </span>
                    </TableCell>

                    {!isView && (
                      <TableCell>
                        <IconButton color="error" onClick={() => supprimerLigne(ligne.id)}>
                          <FaTrash />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 15, borderTop: "1px solid #374151" }}>
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

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#94A3B8" }}>
              Total HT : <b>{sousTotal.toLocaleString()} F</b>
            </div>
            <div style={{ color: "#10B981", fontSize: 15, fontWeight: "bold" }}>
              TOTAL TTC : {total.toLocaleString()} F
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default FormVente;