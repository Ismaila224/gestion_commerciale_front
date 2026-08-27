import { useEffect, useState } from "react";
import { getPaiements } from "../../services/paiementService";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Pagination
} from "@mui/material";

function PaiementList() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreMode, setFiltreMode] = useState("Tous");
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;
 

  useEffect(() => {
    let isMounted = true;

    getPaiements()
      .then((data) => {
        if (isMounted) {
          setPaiements(data || []);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRecherche = (e) => {
    setRecherche(e.target.value);
    setPage(1);
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case "especes": return { label: "Espèces", color: "#10B981", bg: "#10B9811a" };
      case "mobile_money": return { label: "Mobile Money", color: "#F59E0B", bg: "#F59E0B1a" };
      case "carte": return { label: "Carte Bancaire", color: "#3B82F6", bg: "#3B82F61a" };
      case "virement": return { label: "Virement", color: "#8B5CF6", bg: "#8B5CF61a" };
      case "cheque": return { label: "Chèque", color: "#EC4899", bg: "#EC48991a" };
      default: return { label: mode || "N/A", color: "#94A3B8", bg: "#94A3B81a" };
    }
  };

  const paiementsFiltres = paiements.filter((p) => {
    const clientNom = p.vente?.client
      ? `${p.vente.client.nom} ${p.vente.client.prenom}`
      : "Client Ordinaire";
    const ref = p.reference || "";
    const venteId = p.vente_id ? `#V-${p.vente_id}` : "";

    const rechercheOk = `${clientNom} ${ref} ${venteId} ${p.montant}`
      .toLowerCase()
      .includes(recherche.toLowerCase());

    const isEspeces = p.mode === "especes";
    const isMobile = p.mode === "mobile_money";
    const isAutres = p.mode !== "especes" && p.mode !== "mobile_money";

    let modeOk = true;
    if (filtreMode === "especes") modeOk = isEspeces;
    else if (filtreMode === "mobile_money") modeOk = isMobile;
    else if (filtreMode === "autres") modeOk = isAutres;

    return rechercheOk && modeOk;
  });

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "20%" }}>
        Chargement des paiements...
      </div>
    );
  }

  const totalPages = Math.ceil(paiementsFiltres.length / itemsPerPage);
  const handlePageChange = (event, value) => setPage(value);

  const total = paiements.length;
  const nbEspeces = paiements.filter((p) => p.mode === "especes").length;
  const nbMobile = paiements.filter((p) => p.mode === "mobile_money").length;
  const nbAutres = total - (nbEspeces + nbMobile);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <h2 style={{ color: "white", marginLeft: "10px", marginBottom: "20px" }}>Historique des Paiements</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "1px", marginTop: "2px" }}>
          <button
            onClick={() => { setFiltreMode("Tous"); setPage(1); }}
            style={{ backgroundColor: filtreMode === "Tous" ? "#7C3AED" : "#111827", margin: "5px", color: "white", border: "1px solid #7C3AED", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Tous({total})
          </button>
          <button
            onClick={() => { setFiltreMode("especes"); setPage(1); }}
            style={{ backgroundColor: filtreMode === "especes" ? "#10B981" : "#111827", margin: "5px", color: filtreMode === "especes" ? "white" : "#10B981", border: "1px solid #10B981", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Espèces({nbEspeces})
          </button>
          <button
            onClick={() => { setFiltreMode("mobile_money"); setPage(1); }}
            style={{ backgroundColor: filtreMode === "mobile_money" ? "#F59E0B" : "#111827", margin: "5px", color: filtreMode === "mobile_money" ? "white" : "#F59E0B", border: "1px solid #F59E0B", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Mobile Money({nbMobile})
          </button>
          {nbAutres > 0 && (
            <button
              onClick={() => { setFiltreMode("autres"); setPage(1); }}
              style={{ backgroundColor: filtreMode === "autres" ? "#3B82F6" : "#111827", margin: "5px", color: filtreMode === "autres" ? "white" : "#3B82F6", border: "1px solid #3B82F6", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
            >
              Autres({nbAutres})
            </button>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Rechercher ..."
            value={recherche}
            onChange={handleRecherche}
            style={{ backgroundColor: "#111827", color: "#94A3B8", border: "1px solid #94A3B8", padding: "5px", borderRadius: "10px", marginRight: "20px" }}
          />
        </div>
      </div>

      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #262d382e" } }}>
          <TableHead sx={{ backgroundColor: "#111827" }}>
            <TableRow sx={{ "& th": { color: "#94A3B8" } }}>
              <TableCell># VENTE</TableCell>
              <TableCell>CLIENT</TableCell>
              <TableCell>DATE RÈGLEMENT</TableCell>
              <TableCell>MODE</TableCell>
              <TableCell>RÉFÉRENCE</TableCell>
              <TableCell align="right">MONTANT RÉGLÉ</TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ backgroundColor: "#0c101a" }}>
            {paiementsFiltres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: "#94A3B8", py: 3 }}>
                  Aucun paiement trouvé pour la recherche.
                </TableCell>
              </TableRow>
            ) : (
              paiementsFiltres.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((paiement) => {
                const modeInfo = getModeLabel(paiement.mode);
                const client = paiement.vente?.client;

                return (
                  <TableRow key={paiement.id}>
                    <TableCell sx={{ color: "#7C3AED", fontWeight: "bold" }}>
                      #V-{paiement.vente_id}
                    </TableCell>
                    <TableCell sx={{ color: "#94A3B8" }}>
                      <span style={{ backgroundColor: "#0d214c", width: 45, height: 45, fontWeight: "bold", display: "inline-block", textAlign: "center", lineHeight: "45px", color: "#94A3B8", borderRadius: "10px", marginRight: "10px" }}>
                        {client?.nom?.charAt(0).toUpperCase() || 'C'}
                      </span>
                      <div style={{ display: "inline-block", verticalAlign: "middle", color: "#94A3B8" }}>
                        <span>{client ? `${client.nom} ${client.prenom}` : 'Client Ordinaire'}</span>
                        <br />
                        <span style={{ color: "#32373e" }}>{client?.telephone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell sx={{ color: "#94A3B8" }}>{paiement.date_paiement}</TableCell>
                    <TableCell>
                      <div style={{ height: "30px", color: modeInfo.color, borderRadius: "10px", backgroundColor: modeInfo.bg, textAlign: "center", alignItems: "center", display: "flex", justifyContent: "center", padding: "0 10px", width: "fit-content" }}>
                        {modeInfo.label}
                      </div>
                    </TableCell>
                    <TableCell sx={{ color: "#94A3B8" }}>
                      {paiement.reference || "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#10B981", fontWeight: "bold", fontSize: "15px" }}>
                      + {Number(paiement.montant).toLocaleString()} F
                    </TableCell>
                    
                  </TableRow>
                );
              })
            )}
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

export default PaiementList;