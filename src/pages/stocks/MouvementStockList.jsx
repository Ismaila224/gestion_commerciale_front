import { useEffect, useState } from "react";
import { getMouvementsStock } from "../../services/mouvementStockService";
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

function MouvementStockList() {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState("Tous");
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;

    getMouvementsStock()
      .then((data) => {
        if (isMounted) {
          // Gestion sécurisée de la réponse (tableau ou objet avec data)
          const liste = Array.isArray(data) ? data : (data?.data || []);
          setMouvements(liste);
        }
      })
      .catch((error) => console.error("Erreur chargement mouvements:", error))
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

  const getTypeLabel = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("entre") || t.includes("entrée") || t === "approvisionnement") {
      return { label: "Entrée", color: "#10B981", bg: "#10B9811a" };
    }
    if (t.includes("sortie") || t === "vente") {
      return { label: "Sortie", color: "#EF4444", bg: "#EF44441a" };
    }
    if (t.includes("ajustement")) {
      return { label: "Ajustement", color: "#F59E0B", bg: "#F59E0B1a" };
    }
    return { label: type || "Autre", color: "#94A3B8", bg: "#94A3B81a" };
  };

  const mouvementsFiltres = mouvements.filter((m) => {
    if (!m) return false;
    const produitNom = m.produit?.nom || "";
    const motif = m.motif || "";
    const auteur = m.utilisateur?.name || m.user?.name || "";

    const rechercheOk = `${produitNom} ${motif} ${auteur} ${m.type || ""}`
      .toLowerCase()
      .includes(recherche.toLowerCase());

    const typeLower = (m.type || "").toLowerCase();
    const isEntree = typeLower.includes("entre") || typeLower.includes("entrée") || typeLower === "approvisionnement";
    const isSortie = typeLower.includes("sortie") || typeLower === "vente";
    const isAjustement = typeLower.includes("ajustement");

    let typeOk = true;
    if (filtreType === "entree") typeOk = isEntree;
    else if (filtreType === "sortie") typeOk = isSortie;
    else if (filtreType === "ajustement") typeOk = isAjustement;

    return rechercheOk && typeOk;
  });

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "20%" }}>
        Chargement des mouvements de stock...
      </div>
    );
  }

  const totalPages = Math.ceil(mouvementsFiltres.length / itemsPerPage);
  const handlePageChange = (event, value) => setPage(value);

  const total = mouvements.length;
  const nbEntrees = mouvements.filter((m) => {
    const t = (m?.type || "").toLowerCase();
    return t.includes("entre") || t.includes("entrée") || t === "approvisionnement";
  }).length;
  const nbSorties = mouvements.filter((m) => {
    const t = (m?.type || "").toLowerCase();
    return t.includes("sortie") || t === "vente";
  }).length;
  const nbAjustements = total - (nbEntrees + nbSorties);

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <h2 style={{ color: "white", marginLeft: "10px", marginBottom: "20px" }}>Mouvements de Stock</h2>
        </div>

        {/* Boutons de Filtres */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => { setFiltreType("Tous"); setPage(1); }}
            style={{ backgroundColor: filtreType === "Tous" ? "#7C3AED" : "#111827", margin: "5px", color: "white", border: "1px solid #7C3AED", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Tous({total})
          </button>
          <button
            onClick={() => { setFiltreType("entree"); setPage(1); }}
            style={{ backgroundColor: filtreType === "entree" ? "#10B981" : "#111827", margin: "5px", color: filtreType === "entree" ? "white" : "#10B981", border: "1px solid #10B981", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Entrées({nbEntrees})
          </button>
          <button
            onClick={() => { setFiltreType("sortie"); setPage(1); }}
            style={{ backgroundColor: filtreType === "sortie" ? "#EF4444" : "#111827", margin: "5px", color: filtreType === "sortie" ? "white" : "#EF4444", border: "1px solid #EF4444", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
          >
            Sorties({nbSorties})
          </button>
          {nbAjustements > 0 && (
            <button
              onClick={() => { setFiltreType("ajustement"); setPage(1); }}
              style={{ backgroundColor: filtreType === "ajustement" ? "#F59E0B" : "#111827", margin: "5px", color: filtreType === "ajustement" ? "white" : "#F59E0B", border: "1px solid #F59E0B", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
            >
              Ajustements({nbAjustements})
            </button>
          )}
        </div>

        {/* Recherche */}
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

      <TableContainer component={Paper} sx={{ marginBottom: "20px", backgroundColor: "#0c101a" }}>
        <Table sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #262d382e" } }}>
          <TableHead sx={{ backgroundColor: "#111827" }}>
            <TableRow sx={{ "& th": { color: "#94A3B8" } }}>
              <TableCell>PRODUIT</TableCell>
              <TableCell>TYPE</TableCell>
              <TableCell align="center">QUANTITÉ</TableCell>
              <TableCell>MOTIF / RAISON</TableCell>
              <TableCell align="right">DATE</TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ backgroundColor: "#0c101a" }}>
            {mouvementsFiltres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "#94A3B8", py: 3 }}>
                  Aucun mouvement de stock trouvé.
                </TableCell>
              </TableRow>
            ) : (
              mouvementsFiltres.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((mvt) => {
                const typeInfo = getTypeLabel(mvt.type);
                const quantiteNombre = Number(mvt.quantite || 0);

                return (
                  <TableRow key={mvt.id}>
                    <TableCell sx={{ color: "#94A3B8" }}>
                      <span style={{ backgroundColor: "#0d214c", width: 40, height: 40, fontWeight: "bold", display: "inline-block", textAlign: "center", lineHeight: "40px", color: "#94A3B8", borderRadius: "10px", marginRight: "10px" }}>
                        {mvt.produit?.nom?.charAt(0).toUpperCase() || 'P'}
                      </span>
                      <div style={{ display: "inline-block", verticalAlign: "middle", color: "#94A3B8" }}>
                        <span style={{ fontWeight: "bold", color: "white" }}>{mvt.produit?.nom || 'Produit non spécifié'}</span>
                        <br />
                        <span style={{ color: "#64748B", fontSize: "12px" }}>Réf: {mvt.produit?.reference || "N/A"}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div style={{ height: "28px", color: typeInfo.color, borderRadius: "10px", backgroundColor: typeInfo.bg, textAlign: "center", alignItems: "center", display: "flex", justifyContent: "center", padding: "0 10px", width: "fit-content", fontSize: "13px" }}>
                        {typeInfo.label}
                      </div>
                    </TableCell>

                    <TableCell align="center" sx={{ color: typeInfo.label =="Entrée" ? "#10B981" : "#EF4444", fontWeight: "bold", fontSize: "15px" }}>
                      {typeInfo.label =="Entrée" ? `+${quantiteNombre}` : -quantiteNombre}
                    </TableCell>

                    <TableCell sx={{ color: "#94A3B8" }}>
                      {mvt.motif || "—"}
                    </TableCell>

                    <TableCell align="right" sx={{ color: "#64748B" }}>
                      {mvt.created_at || "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack spacing={2} sx={{mt: 2 }}>
          <Pagination
            count={totalPages}
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
      )}
    </div>
  );
}

export default MouvementStockList;