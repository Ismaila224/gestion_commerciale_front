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
import { getFournisseurs } from "../../services/fournisseurService";
import { createApprovisionnement, getApprovisionnement} from "../../services/approService";

function FormAppro() {

  const { id } = useParams();
  const isView = !!id;
  
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [open, setOpen] = useState(false)

  const [fournisseurId, setFournisseurId] = useState("");
  const [dateCommande, setDateCommande] = useState("");
  const [lignes, setLignes] = useState([]);
  const [produitSelectionne, setProduitSelectionne] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {

    const charger = async () => {

        try {

            const fournisseursData = await getFournisseurs();

            const produitsData = await getProduits();

            setFournisseurs(fournisseursData || []);

            setProduits(produitsData || []);

        } catch (e) {

            console.log(e);

        }

    };

    charger();

}, []);
useEffect(() => {

    if (!isView) return;

    const chargerApprovisionnement = async () => {

        try {

            const appro = await getApprovisionnement(id);

            setFournisseurId(appro.fournisseur.id);

            setDateCommande(appro.date_approvisionnement);

            const lignesFormatees = appro.lignes.map((ligne) => ({

                id: ligne.id,

                produit: ligne.produit,

                quantite: ligne.quantite,

                prix: ligne.prix_unitaire,

            }));

            setLignes(lignesFormatees);

        } catch (e) {

            console.log(e);

        }

    };

    chargerApprovisionnement();

}, [id, isView]);

  const ajouterArticle = () => {
    if (!produitSelectionne) return;

    const produit = produits.find((p) => p.id == produitSelectionne);
    if (!produit) return;

    const existe = lignes.find((l) => l.produit.id === produit.id);
    if (existe) return;

    setLignes([
      ...lignes,
      {
        id: Date.now(),
        produit,
        quantite: 1,
        prix: produit.prix_achat || 0,
      },
    ]);

    setProduitSelectionne("");
  };

const enregistrerApprovisionnement = async () => {
    try {
        const data = {
        fournisseur_id: fournisseurId,
        date_approvisionnement: dateCommande,
        lignes: lignes.map((ligne) => ({
            produit_id: ligne.produit.id,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix,
            prix_total: ligne.quantite * ligne.prix,
        })),
    };
        const response = await createApprovisionnement(data);
        toast.success("Approvisionnement enregistré avec succès !");
        console.log(response);
    } catch (error) {
        console.log(error.response);
        console.log(error.response.data);
        console.log(error.response.data.errors);
        toast.error("Remplir tous les champs !");
    }
};


  const supprimerLigne = (id) => {
    const nouvellesLignes = lignes.filter((l) => l.id !== id);
    setLignes(nouvellesLignes);

    const maxPages = Math.ceil(nouvellesLignes.length / itemsPerPage) || 1;
    if (page > maxPages) {
      setPage(maxPages);
    }
  };

  const modifierQuantite = (id, valeur) => {
    setLignes(
      lignes.map((l) => {
        if (l.id === id) {
          return {
            ...l,
            quantite: Math.max(1, l.quantite + valeur),
          };
        }
        return l;
      })
    );
  };

  const modifierPrix = (id, prix) => {
    setLignes(
      lignes.map((l) =>
        l.id === id
          ? {
              ...l,
              prix: Number(prix),
            }
          : l
      )
    );
  };

  const nombreArticles = lignes.length;
  const quantiteTotale = lignes.reduce((s, l) => s + l.quantite, 0);
  const sousTotal = lignes.reduce((s, l) => s + l.quantite * l.prix, 0);
  const tva = sousTotal * 0.18;
  const total = sousTotal + tva;

  const totalPages = Math.ceil(lignes.length / itemsPerPage);
  const indexDebut = (page - 1) * itemsPerPage;
  const lignesAffichees = lignes.slice(indexDebut, indexDebut + itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div
      style={{
        padding: "25px",
        background: "#000000",
        maxHeight: "90vh",
        color: "white",
      }}
    >
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div
                style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
                }}
            >
                <Button
                startIcon={<FaArrowLeft />}
                
                onClick={() => navigate("/approvisionnements")}
                variant="contained"
                sx={{
                    color: "#94A3B8",
                    border: "1px solid #374151",
                    mr: 2,
                }}
                >
                Retour
                </Button>

                <div>
                <h3 style={{ margin: 0 }}>
                    {isView ? "Détails de l'approvisionnement" : "Nouvel approvisionnement"}
                </h3>

                <span style={{ color: "#94A3B8" }}>
                    {isView ? "Consultation" : "Commande fournisseur"}
                </span>
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
              Enregistrer l'approvisionnement
            </Button>
            )}

              <Dialog open={open} onClose={() => setOpen(false)} disableRestoreFocus>
                  <DialogTitle>Enregistement de l'approvisionnement</DialogTitle>
                  <DialogContent>
                      <DialogContentText>
                          Voulez-vous vraiment enregistrer l'approvisionnement 
                      </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => setOpen(false)} autoFocus>
                          Sortir
                    </Button>
                    <Button onClick={() => { enregistrerApprovisionnement(); setOpen(false);}} autoFocus>Confimer </Button>
                  </DialogActions>
              </Dialog>
        </div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Paper
          sx={{
            background: "#111827",
            color: "#94a3b88e",
            padding: 3,
            borderRadius: 3,
          }}
        >
          <h3>INFORMATIONS</h3>
          <h6 style={{ marginBottom: -10, color: "#94a3b88e" }}>
            Fournisseur*
          </h6>
          <TextField
            sx={{
              backgroundColor: "#000000",
              "& .MuiInputBase-input": { color: "#94A3B8" },
              borderRadius: 2,
            }}
            select
            fullWidth
            value={fournisseurId}
            onChange={(e) => setFournisseurId(e.target.value)}
            label="Fournisseur"
            margin="normal"
          >
            {fournisseurs.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.nom} {f.prenom} - {f.telephone}
              </MenuItem>
            ))}
          </TextField>

          <div
            style={{
              display: "flex",
              gap: 15,
              marginTop: 15,
              marginBottom: 5,
            }}
          >
            <TextField
              sx={{
                backgroundColor: "#000000",
                "& .MuiInputBase-input": { color: "#94A3B8" },
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1)",
                  cursor: "pointer",
                },
                borderRadius: 2,
              }}
              fullWidth
              type="date"
              value={dateCommande}
              onChange={(e) => setDateCommande(e.target.value)}
            />
          </div>
        </Paper>

        <Paper
          sx={{
            background: "#111827",
            color: "#94a3b88e",
            padding: 3,
            borderRadius: 3,
          }}
        >
          <h3>RÉSUMÉ COMMANDE</h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <span>Nb articles</span>
            <b style={{ color: "white" }}>{nombreArticles} référence</b>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <span>Quantité totale</span>
            <b style={{ color: "white" }}>{quantiteTotale} unités</b>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <span>Sous-total HT</span>
            <b style={{ color: "white" }}>
              {sousTotal.toLocaleString()} F
            </b>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <span>TVA (18%)</span>
            <b style={{ color: "white" }}>{tva.toLocaleString()} F</b>
          </div>

          <hr style={{ margin: "20px 0", borderColor: "#374151" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              color: "#10B981",
              fontWeight: "bold",
            }}
          >
            <span>TOTAL TTC</span>
            <span>{total.toLocaleString()} F</span>
          </div>
        </Paper>
      </div>

      <Paper
        sx={{
          background: "#111827c1",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 15,
          }}
        >
          <h4 style={{ color: "white", margin: 0 }}>LIGNES DE COMMANDE</h4>
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
                  {p.nom}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={ajouterArticle}
              disabled={isView}
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
              Ajouter un article
            </Button>
          </div>)}
        </div>

        <TableContainer>
          <Table sx={{"& .MuiTableCell-root": {borderBottom: "1px solid #262d382e",},}}>
            <TableHead sx={{ backgroundColor: "#0406099d" }}>
              <TableRow sx={{ "& th": { color: "#94a3b88e" } }}>
                <TableCell>PRODUIT</TableCell>
                <TableCell>STOCK</TableCell>
                <TableCell>QTE</TableCell>
                <TableCell>PRIX D'ACHAT</TableCell>
                <TableCell>TOTAL LIGNE</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {lignes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ color: "#94A3B8" }}
                  >
                    Aucun article ajouté
                  </TableCell>
                </TableRow>
              ) : (
                lignesAffichees.map((ligne) => (
                  <TableRow key={ligne.id}>
                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          color: "white",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: "#312E81",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {ligne.produit.nom.charAt(0)}
                        </div>

                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {ligne.produit.nom}
                          </div>
                          <div style={{ color: "#94A3B8", fontSize: 13 }}>
                            Réf : {ligne.produit.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        style={{
                          background:
                            ligne.produit.stock_actuel < ligne.produit.stock_min
                              ? "#ef44443b"
                              : "#064e3b8d",
                          color:
                            ligne.produit.stock_actuel < ligne.produit.stock_min
                              ? "#EF4444"
                              : "#10B981",
                          padding: "5px 10px",
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      >
                        {ligne.produit.stock_actuel} / min.
                        {ligne.produit.stock_min}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "#000000",
                          borderRadius: 5,
                          height: 30,
                          color: "white",
                          width: "fit-content",
                          padding: "0 5px",
                        }}
                      >
                        <IconButton
                          sx={{ color: "#7c3aedfb" }}
                          onClick={() => modifierQuantite(ligne.id, -1)}
                          disabled={isView}
                        >
                          -
                        </IconButton>

                        <b>{ligne.quantite}</b>

                        <IconButton
                          sx={{ color: "#7c3aedfb" }}
                          onClick={() => modifierQuantite(ligne.id, 1)}
                          disabled={isView}
                        >
                          +
                        </IconButton>
                      </div>
                    </TableCell>

                    <TableCell>
                      <TextField
                        sx={{
                          backgroundColor: "#000000",
                          "& .MuiInputBase-input": { color: "#94A3B8" },
                          borderRadius: 2,
                        }}
                        size="small"
                        type="number"
                        value={ligne.prix}
                        onChange={(e) =>
                          modifierPrix(ligne.id, e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <span
                        style={{
                          color: "#10B981",
                          fontWeight: "bold",
                        }}
                      >
                        {(ligne.quantite * ligne.prix).toLocaleString()} F
                      </span>
                    </TableCell>
                    {!isView && (
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => supprimerLigne(ligne.id)}
                      >
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
            borderTop: "1px solid #374151",
          }}
        >
          <Stack spacing={2}>
            <Pagination
              count={totalPages || 1}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#94A3B8",
                  borderColor: "#374151",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#7C3AED",
                  color: "white",
                  borderColor: "#7C3AED",
                  "&:hover": {
                    backgroundColor: "#6D28D9",
                  },
                },
              }}
            />
          </Stack>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#94A3B8" }}>
              Total HT : <b>{sousTotal.toLocaleString()} F</b>
            </div>

            <div
              style={{
                color: "#10B981",
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              TOTAL TTC : {total.toLocaleString()} F
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default FormAppro;