import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import { getApprovisionnements, recevoirApprovisionnement, annulerApprovisionnement } from "../../services/approService";
import {FaEye,FaTrash } from "react-icons/fa";
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
  Button
} from "@mui/material";

function ApproList() {

const [dialog, setDialog] = useState({
    open: false,
    type: "",
    id: null
});
const navigate = useNavigate();
const recevoirApprovisionnementHandler = async (id) => {
  try {
    await recevoirApprovisionnement(id);
    toast.success("Commande reçue avec succès !");
    chargerAppro();
  } catch (error) {
    console.log(error.response);
    console.log(error.response.data);
    console.log(error.response.data.message);
  }
};

const annulerApprovisionnementHandler = async (id) => {
  try {
    await annulerApprovisionnement(id);
    toast.success("Commande annulée avec succès !");
    chargerAppro();
  } catch (error) {
    console.log(error.response);
    console.log(error.response.data);
    console.log(error.response.data.message);
  }
};

const [page, setPage] = useState(1);
  const itemsPerPage = 6;
const [approvisionnements, setApprovisionnements] = useState([]);
const [loading, setLoading] = useState(true);
const [recherche, setRecherche] = useState("");
const [filtreStatut, setFiltreStatut] = useState("Tous");

 const chargerAppro = async () => {
    try {
        const data = await getApprovisionnements();
        setApprovisionnements(data);
        setLoading(false);
    } catch (error) {
        console.error(error);
    }
};

useEffect(() => {
    chargerAppro();
}, []);
 
const approvisionnementsFiltres = approvisionnements.filter((approvisionnement) => {

    const rechercheOk =
        `${approvisionnement.fournisseur.nom} ${approvisionnement.montant}`
            .toLowerCase()
            .includes(recherche.toLowerCase());

    const statutOk =
        filtreStatut === "Tous" ||
        approvisionnement.statut === filtreStatut;

    return rechercheOk && statutOk;

});
if (loading) {
  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "20%" }}>
      Chargement des approvisionnements...
    </div>
  );
} 


  const totalPages = Math.ceil(approvisionnementsFiltres.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };
const total = approvisionnements.length;

const nbEnAttente = approvisionnements.filter(
  (a) => a.statut === "En attente"
).length;

const nbRecu = approvisionnements.filter(
  (a) => a.statut === "Reçu"
).length;

const nbAnnule = approvisionnements.filter(
  (a) => a.statut === "Annuler"
).length;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <h2 style={{color: "white", marginLeft: "10px", marginBottom: "20px"}}>Approvisionnement </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1px",marginTop: "2px" }}>
            <button onClick={() => setFiltreStatut("Tous")} style={{ backgroundColor:  filtreStatut === "Tous" ? "#7C3AED" : "#111827", margin: "10px", color: "white", border: "1px solid #7C3AED", padding: "5px 10px", marginLeft: "10px", borderRadius: "20px", cursor: "pointer" }}>
                Tous({total})
            </button>
            <button onClick={() => setFiltreStatut("En attente")} style={{ backgroundColor:  filtreStatut === "En attente" ? "#f6f60a" : "#111827", margin: "10px", color: filtreStatut === "En attente" ? "black" : "#f6f60a", border: "1px solid #f6f60a", padding: "5px 10px", marginLeft: "10px", borderRadius: "20px", cursor: "pointer" }}>
                En attente({nbEnAttente})
            </button>
            <button onClick={() => setFiltreStatut("Reçu")} style={{ backgroundColor:  filtreStatut === "Reçu" ? "#10B981" : "#111827", margin: "10px", color: filtreStatut === "Reçu" ? "white" : "#10B981", border: "1px solid #10B981", padding: "5px 10px", marginLeft: "10px", borderRadius: "20px", cursor: "pointer" }}>
                Reçu({nbRecu})
            </button>
            <button onClick={() => setFiltreStatut("Annuler")} style={{ backgroundColor:  filtreStatut === "Annuler" ? "#EF4444" : "#111827", margin: "10px", color: filtreStatut === "Annuler" ? "white" : "#EF4444", border: "1px solid #EF4444", padding: "5px 10px", marginLeft: "10px", borderRadius: "20px", cursor: "pointer" }}>
                Annuler({nbAnnule})
            </button>

        </div>
        <div>
          <input
            type="text"
            placeholder="Rechercher ..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ backgroundColor: "#111827", color: "#94A3B8", border: "1px solid #94A3B8", padding: "5px", borderRadius: "10px" }}
          />
          <button onClick={() => navigate("/approvisionnements/new")} style={{ backgroundColor: "#7C3AED", color: "white", border: "none", padding: "5px 10px", marginLeft: "20px", borderRadius: "10px", cursor: "pointer",marginRight: "20px" }}>
            + Nouvel appro
          </button>
        </div>
      </div>

      <Dialog
    open={dialog.open}
    onClose={() =>
        setDialog({
            open: false,
            type: "",
            id: null,
        })
    }
    disableRestoreFocus
>
    <DialogTitle>
        {dialog.type === "recevoir"
            ? "Réception de la commande"
            : "Annulation de la commande"}
    </DialogTitle>

    <DialogContent>
        <DialogContentText>
            {dialog.type === "recevoir"
                ? "Voulez-vous vraiment confirmer la réception de cette commande ?"
                : "Voulez-vous vraiment annuler cette commande ?"}
        </DialogContentText>
    </DialogContent>

    <DialogActions>

        <Button
            onClick={() =>
                setDialog({
                    open: false,
                    type: "",
                    id: null,
                })
            }
        >
            Sortir
        </Button>

        <Button
            onClick={() => {
                if (dialog.type === "recevoir") {
                    recevoirApprovisionnementHandler(dialog.id);
                } else {
                    annulerApprovisionnementHandler(dialog.id);
                }

                setDialog({
                    open: false,
                    type: "",
                    id: null,
                });
            }}
        >
            Confirmer
        </Button>

    </DialogActions>
</Dialog>
      
        <TableContainer component={Paper} sx={{marginBottom: "20px"}} >
        <Table sx={{"& .MuiTableCell-root": {borderBottom: "1px solid #262d382e",},}}>

            <TableHead sx={{ backgroundColor: "#111827", color: "white" }}>

            <TableRow sx={{ "& th": { color: "#94A3B8" } }}>

                <TableCell># APPRO</TableCell>

                <TableCell>FOURNISSEUR</TableCell>

                <TableCell>DATE COMMANDE</TableCell>

                <TableCell>ARTICLES</TableCell>

                <TableCell>MONTANT</TableCell>

                <TableCell>STATUT</TableCell>

                <TableCell align="center">Actions</TableCell>

            </TableRow>

            </TableHead>

            <TableBody sx={{ backgroundColor: "#0c101a", color: "white" }}>

            {approvisionnementsFiltres.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((approvisionnement) => (

                <TableRow key={approvisionnement.id}>

                <TableCell sx={{ color: "white" }}>#0-{approvisionnement.id}</TableCell>

                <TableCell sx={{ color: "#94A3B8"}}>
                  <span style={{ backgroundColor: "#0d214c", width: 45, height: 45, fontWeight: "bold", display: "inline-block", textAlign: "center", lineHeight: "45px", color: "#94A3B8", borderRadius: "10px", marginRight: "10px" }}>
                    {approvisionnement.fournisseur.nom?.charAt(0).toUpperCase() ?? ''} 
                  </span>
                  <div style={{ display: "inline-block", verticalAlign: "middle", color: "#94A3B8" }}>
                  <span>{approvisionnement.fournisseur.nom_complet}</span>
                  <br />
                  <span style={{ color: "#32373e" }}>
                    {approvisionnement.fournisseur.telephone}
                  </span>
                  </div>
                </TableCell>
                
                <TableCell sx={{ color: "#94A3B8" }}>{approvisionnement.date_approvisionnement}</TableCell>
 
                <TableCell sx={{ color: "#94A3B8" }}>{approvisionnement.lignes.length} réf</TableCell>

                <TableCell sx={{ color: "#94A3B8" }}>{approvisionnement.montant_total}</TableCell>

                <TableCell>
                    <div style={{height: "30px", color: approvisionnement.statut === "En attente" ? "#f6f60a" : approvisionnement.statut === "Reçu" ? "#10B981" : "#EF4444", borderRadius: "10px", backgroundColor: approvisionnement.statut === "En attente" ? "#f6f60a1a" : approvisionnement.statut === "Reçu" ? "#10B9811a" : "#EF44441a", textAlign: "center", alignItems: "center", display: "flex", justifyContent: "center", padding: "0 10px" }}>
                      {approvisionnement.statut}
                    </div>
                </TableCell>

                <TableCell align="center">
                  

                  {approvisionnement.statut === "En attente" && (
                      <>
                          <button variant="outlined" style={{backgroundColor: "#f6f60a1a", color: "#10B981", border: "1px solid #10B981", padding: "5px 10px", borderRadius: "5px", cursor: "pointer"}} onClick={() =>  setDialog({open: true, type: "recevoir", id: approvisionnement.id,})}>
                              Recevoir
                          </button>

                          <Tooltip title="Annuler">
                              <IconButton color="error" onClick={() =>  setDialog({open: true, type: "annuler", id: approvisionnement.id,})}>
                                  <FaTrash />
                              </IconButton>
                          </Tooltip>
                          
                      </>
                      
                  )}
                  <Tooltip title="Voir">
                      <IconButton color="primary" onClick={() => navigate(`/approvisionnements/${approvisionnement.id}`)}>
                          <FaEye />
                      </IconButton>
                  </Tooltip>

              </TableCell>

                </TableRow>

            ))}

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
    </div>
    
  )};

export default ApproList;