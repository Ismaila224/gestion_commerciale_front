import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVente } from "../../services/venteService";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

function Facture() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vente, setVente] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const chargerVente = async () => {
            try {
                const data = await getVente(id);
                setVente(data);
            } catch (error) {
                console.error("Erreur lors du chargement de la facture :", error);
            } finally {
                setLoading(false);
            }
        };

        chargerVente();
    }, [id]);

    const imprimer = () => {
        window.print();
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#020617" }}>
                <CircularProgress sx={{ color: "#7C3AED" }} />
            </Box>
        );
    }

    if (!vente) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", p: 4 }}>
                <Typography>Impossible de charger la facture.</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2, color: "#A78BFA" }}>
                    Retour
                </Button>
            </Box>
        );
    }

    const client = vente.client;
    const lignes = vente.lignes || [];
    const paiements = vente.paiements || [];
    const montantTotal = Number(vente.montant_total || 0);
    const montantPaye = Number(vente.montant_paye ?? paiements.reduce((total, paiement) => total + Number(paiement.montant || 0), 0));
    const resteAPayer = Number(vente.reste_a_payer ?? montantTotal - montantPaye);

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#020617", p: { xs: 1, md: 3 } }}>
            <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Button startIcon={<FaArrowLeft />} onClick={() => navigate(-1)} sx={{ color: "#CBD5E1", textTransform: "none" }}>
                    Retour
                </Button>

                <Button startIcon={<FaPrint />} variant="contained" onClick={imprimer} sx={{ backgroundColor: "#7C3AED", textTransform: "none", borderRadius: 2, "&:hover": { backgroundColor: "#6D28D9" } }}>
                    Imprimer
                </Button>
            </Box>

            <Paper
                id="facture"
                sx={{
                    maxWidth: 900,
                    mx: "auto",
                    p: { xs: 2, md: 5 },
                    backgroundColor: "white",
                    color: "#111827",
                    borderRadius: 2,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)"
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 3, mb: 5 }}>
                    <Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#7C3AED" }}>
                            GesCom
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: 13 }}>
                            Gestion commerciale
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: 25, fontWeight: 800, color: "#111827" }}>
                            FACTURE
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: 13 }}>
                            N° FAC-{vente.id}
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: 13 }}>
                            Vente N° V-{vente.id}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3, mb: 4 }}>
                    <Box sx={{ p: 2, backgroundColor: "#F8FAFC", borderRadius: 2 }}>
                        <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 700, mb: 0.5 }}>
                            CLIENT
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                            {client ? `${client.nom || ""} ${client.prenom || ""}` : "Client Ordinaire"}
                        </Typography>
                        {client?.telephone && (
                            <Typography sx={{ fontSize: 13, color: "#64748B", mt: 0.5 }}>
                                {client.telephone}
                            </Typography>
                        )}
                        {client?.email && (
                            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                                {client.email}
                            </Typography>
                        )}
                        {client?.adresse && (
                            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                                {client.adresse}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ p: 2, backgroundColor: "#F8FAFC", borderRadius: 2 }}>
                        <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 700, mb: 0.5 }}>
                            INFORMATIONS
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                            Date de vente
                        </Typography>
                        <Typography sx={{ fontWeight: 600, mb: 1 }}>
                            {vente.date_vente || "-"}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                            Statut
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: vente.statut === "annulee" ? "#EF4444" : "#10B981" }}>
                            {vente.statut || "-"}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 4, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#111827", color: "white" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontSize: 12 }}>PRODUIT</th>
                                <th style={{ padding: "12px", textAlign: "center", fontSize: 12 }}>QUANTITÉ</th>
                                <th style={{ padding: "12px", textAlign: "right", fontSize: 12 }}>PRIX UNITAIRE</th>
                                <th style={{ padding: "12px", textAlign: "right", fontSize: 12 }}>TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lignes.map((ligne) => {
                                const quantite = Number(ligne.quantite || 0);
                                const prix = Number(ligne.prix_unitaire || 0);
                                const totalLigne = quantite * prix;

                                return (
                                    <tr key={ligne.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                        <td style={{ padding: "13px 12px", fontSize: 13 }}>
                                            <strong>{ligne.produit?.nom || "Produit supprimé"}</strong>
                                            {ligne.produit?.reference && (
                                                <div style={{ color: "#64748B", fontSize: 11 }}>
                                                    Réf : {ligne.produit.reference}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "13px 12px", textAlign: "center", fontSize: 13 }}>
                                            {quantite}
                                        </td>
                                        <td style={{ padding: "13px 12px", textAlign: "right", fontSize: 13 }}>
                                            {prix.toLocaleString()} F
                                        </td>
                                        <td style={{ padding: "13px 12px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>
                                            {totalLigne.toLocaleString()} F
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
                    <Box sx={{ width: { xs: "100%", sm: 330 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #E5E7EB" }}>
                            <Typography sx={{ color: "#64748B" }}>Sous-total</Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                                {montantTotal.toLocaleString()} F
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #E5E7EB" }}>
                            <Typography sx={{ color: "#64748B" }}>Montant payé</Typography>
                            <Typography sx={{ color: "#10B981", fontWeight: 700 }}>
                                {montantPaye.toLocaleString()} F
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Reste à payer</Typography>
                            <Typography sx={{ color: resteAPayer > 0 ? "#EF4444" : "#10B981", fontWeight: 800, fontSize: 16 }}>
                                {resteAPayer.toLocaleString()} F
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, backgroundColor: "#F5F3FF", borderRadius: 2 }}>
                            <Typography sx={{ fontWeight: 800 }}>TOTAL</Typography>
                            <Typography sx={{ color: "#7C3AED", fontWeight: 800, fontSize: 18 }}>
                                {montantTotal.toLocaleString()} F
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {paiements.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 1.5 }}>
                            Historique des paiements
                        </Typography>

                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#F8FAFC" }}>
                                    <th style={{ padding: "10px", textAlign: "left", fontSize: 12 }}>DATE</th>
                                    <th style={{ padding: "10px", textAlign: "left", fontSize: 12 }}>MODE</th>
                                    <th style={{ padding: "10px", textAlign: "left", fontSize: 12 }}>RÉFÉRENCE</th>
                                    <th style={{ padding: "10px", textAlign: "right", fontSize: 12 }}>MONTANT</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paiements.map((paiement) => (
                                    <tr key={paiement.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                        <td style={{ padding: "10px", fontSize: 12 }}>
                                            {paiement.date_paiement || "-"}
                                        </td>
                                        <td style={{ padding: "10px", fontSize: 12 }}>
                                            {paiement.mode || "-"}
                                        </td>
                                        <td style={{ padding: "10px", fontSize: 12 }}>
                                            {paiement.reference || "-"}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "right", color: "#10B981", fontWeight: 700, fontSize: 12 }}>
                                            {Number(paiement.montant || 0).toLocaleString()} F
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}

                <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 3, textAlign: "center" }}>
                    <Typography sx={{ color: "#64748B", fontSize: 12 }}>
                        Merci pour votre confiance.
                    </Typography>
                    <Typography sx={{ color: "#94A3B8", fontSize: 10, mt: 0.5 }}>
                        GesCom — Gestion commerciale
                    </Typography>
                </Box>
            </Paper>

            <style>
                {`
                    @media print {
                        @page {
                            size: A4;
                            margin: 10mm;
                        }

                        body {
                            margin: 0;
                            background: white !important;
                        }

                        body * {
                            visibility: hidden;
                        }

                        #facture,
                        #facture * {
                            visibility: visible;
                        }

                        #facture {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            max-width: none;
                            margin: 0;
                            padding: 0;
                            box-shadow: none !important;
                            border-radius: 0;
                        }

                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </Box>
    );
}

export default Facture;