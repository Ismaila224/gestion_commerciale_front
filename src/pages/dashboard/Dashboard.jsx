import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/dashboardService";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Chip,
    LinearProgress,
    Tooltip
} from "@mui/material";
import {
    AttachMoney,
    ShoppingCart,
    People,
    Warning,
    Refresh,
    ArrowForward,
    Person
} from "@mui/icons-material";

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const chargerDashboard = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            const res = await getDashboardStats();
            setData(res);
        } catch (error) {
            console.error("Erreur Dashboard :", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        chargerDashboard();
    }, []);

    if (loading) {
        return (
            <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                Chargement du tableau de bord...
            </Box>
        );
    }

    const kpis = data?.kpis || {};
    const ventes = data?.dernieres_ventes || [];
    const alertesStock = data?.alertes_stock || [];

    const chiffreAffaires = Number(kpis.chiffre_affaires || 0);
    const totalClients = Number(kpis.total_clients || 0);
    const totalVentes = Number(kpis.total_ventes || 0);
    const produitsRupture = Number(kpis.produits_rupture || 0);

    const date = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const kpiCards = [
        {
            title: "Total clients",
            value: totalClients,
            icon: <People />,
            color: "#8B5CF6",
            background: "rgba(139,92,246,0.12)",
            subtitle: "Clients enregistrés"
        },
        {
            title: "Chiffre d'affaires",
            value: `${chiffreAffaires.toLocaleString("fr-FR")} F`,
            icon: <AttachMoney />,
            color: "#10B981",
            background: "rgba(16,185,129,0.12)",
            subtitle: "Montant total des ventes"
        },
        {
            title: "Ventes validées",
            value: totalVentes,
            icon: <ShoppingCart />,
            color: "#60A5FA",
            background: "rgba(96,165,250,0.12)",
            subtitle: "Ventes réalisées"
        },
        {
            title: "Ruptures stock",
            value: produitsRupture,
            icon: <Warning />,
            color: "#F87171",
            background: "rgba(239,68,68,0.12)",
            subtitle: produitsRupture > 0 ? "Action requise" : "Stock disponible"
        }
    ];

    const getStatutStyle = (statut) => {
        const value = String(statut || "").toLowerCase();

        if (value.includes("valid")) {
            return {
                color: "#10B981",
                background: "rgba(16,185,129,0.10)",
                border: "rgba(16,185,129,0.35)"
            };
        }

        if (value.includes("attente")) {
            return {
                color: "#FBBF24",
                background: "rgba(251,191,36,0.10)",
                border: "rgba(251,191,36,0.35)"
            };
        }

        if (value.includes("annul")) {
            return {
                color: "#FB7185",
                background: "rgba(244,63,94,0.10)",
                border: "rgba(244,63,94,0.35)"
            };
        }

        return {
            color: "#94A3B8",
            background: "rgba(148,163,184,0.10)",
            border: "rgba(148,163,184,0.25)"
        };
    };

    return (
        <Box sx={{ p: { xs: 1.5, md: 2 }, color: "white" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5, gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: { xs: 24, md: 27 }, fontWeight: 700, lineHeight: 1.1 }}>
                        Tableau de bord
                    </Typography>
                    <Typography sx={{ color: "#64748B", fontSize: 13, mt: 0.5, textTransform: "capitalize" }}>
                        {date}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Actualiser">
                        <IconButton
                            onClick={() => chargerDashboard(true)}
                            disabled={refreshing}
                            sx={{
                                width: 40,
                                height: 40,
                                color: "#94A3B8",
                                backgroundColor: "#111827",
                                border: "1px solid #263244",
                                borderRadius: 2,
                                "&:hover": {
                                    color: "white",
                                    backgroundColor: "#172033"
                                }
                            }}
                        >
                            <Refresh sx={{ fontSize: 19 }} />
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="contained"
                        startIcon={<ShoppingCart sx={{ fontSize: 17 }} />}
                        sx={{
                            height: 40,
                            px: 2,
                            borderRadius: 2,
                            background: "linear-gradient(135deg,#8B5CF6,#6366F1)",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
                                boxShadow: "none"
                            }
                        }}
                    >
                        Nouvelle vente
                    </Button>
                </Box>
            </Box>

            {refreshing && (
                <LinearProgress
                    sx={{
                        mb: 1.5,
                        height: 2,
                        borderRadius: 2,
                        backgroundColor: "#1E293B",
                        "& .MuiLinearProgress-bar": {
                            backgroundColor: "#8B5CF6"
                        }
                    }}
                />
            )}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2,1fr)",
                        md: "repeat(4,1fr)"
                    },
                    gap: 1.5,
                    mb: 1.5
                }}
            >
                {kpiCards.map((card) => (
                    <Paper
                        key={card.title}
                        elevation={0}
                        sx={{
                            p: 1.7,
                            minHeight: 125,
                            borderRadius: 2.5,
                            backgroundColor: "#111827",
                            border: "1px solid #263244",
                            color: "white",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: card.background,
                                color: card.color
                            }}
                        >
                            {card.icon}
                        </Box>

                        <Typography sx={{ color: "#64748B", fontSize: 12, mb: 0.5 }}>
                            {card.title}
                        </Typography>

                        <Typography sx={{ fontSize: 25, fontWeight: 700, pr: 5 }}>
                            {card.value}
                        </Typography>

                        <Typography sx={{ color: card.color, fontSize: 11, mt: 0.5 }}>
                            {card.subtitle}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "minmax(0,2fr) minmax(280px,1.2fr)"
                    },
                    gap: 1.5
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "#111827",
                        border: "1px solid #263244",
                        borderRadius: 2.5,
                        overflow: "hidden"
                    }}
                >
                    <Box
                        sx={{
                            px: 1.7,
                            py: 1.3,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #1F2937"
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#CBD5E1" }}>
                            Dernières ventes
                        </Typography>

                        <Button
                            endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
                            sx={{
                                color: "#8B5CF6",
                                textTransform: "none",
                                fontSize: 12,
                                minWidth: 0,
                                "&:hover": {
                                    backgroundColor: "transparent"
                                }
                            }}
                        >
                            Voir tout
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: "#64748B", fontSize: 10, fontWeight: 700, borderBottom: "1px solid #1F2937" }}>
                                        CLIENT
                                    </TableCell>
                                    <TableCell sx={{ color: "#64748B", fontSize: 10, fontWeight: 700, borderBottom: "1px solid #1F2937" }}>
                                        MONTANT
                                    </TableCell>
                                    <TableCell sx={{ color: "#64748B", fontSize: 10, fontWeight: 700, borderBottom: "1px solid #1F2937" }}>
                                        STATUT
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {ventes.slice(0, 5).map((vente) => {
                                    const statut = vente.statut || vente.status || "Validée";
                                    const style = getStatutStyle(statut);

                                    return (
                                        <TableRow
                                            key={vente.id}
                                            sx={{
                                                "&:last-child td": {
                                                    borderBottom: 0
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ color: "#CBD5E1", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #1F2937", py: 1.1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#1E293B",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        <Person sx={{ fontSize: 15, color: "#8B5CF6" }} />
                                                    </Box>
                                                    {vente.client?.nom_complet || vente.client?.nom || vente.client_nom || "Client Comptant"}
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ color: "#10B981", fontWeight: 700, fontSize: 12, borderBottom: "1px solid #1F2937", py: 1.1 }}>
                                                {Number(vente.montant_total || vente.montant || 0).toLocaleString("fr-FR")} F
                                            </TableCell>

                                            <TableCell sx={{ borderBottom: "1px solid #1F2937", py: 1.1 }}>
                                                <Chip
                                                    label={statut}
                                                    size="small"
                                                    sx={{
                                                        height: 24,
                                                        color: style.color,
                                                        backgroundColor: style.background,
                                                        border: `1px solid ${style.border}`,
                                                        fontSize: 10,
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {ventes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ color: "#64748B", py: 4 }}>
                                            Aucune vente récente.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "#111827",
                        border: "1px solid #263244",
                        borderRadius: 2.5,
                        overflow: "hidden"
                    }}
                >
                    <Box
                        sx={{
                            px: 1.7,
                            py: 1.3,
                            borderBottom: "1px solid #1F2937"
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#CBD5E1" }}>
                            Alertes stock
                        </Typography>
                    </Box>

                    <Box sx={{ p: 1.3 }}>
                        {alertesStock.length > 0 ? (
                            alertesStock.slice(0, 4).map((alerte, index) => {
                                const stock = Number(alerte.stock ?? alerte.quantite ?? 0);
                                const seuil = Number(alerte.seuil ?? alerte.stock_minimum ?? 1);
                                const pourcentage = Math.min(100, Math.max(5, (stock / Math.max(seuil, 1)) * 100));
                                const rupture = stock === 0;

                                return (
                                    <Box
                                        key={alerte.id || index}
                                        sx={{
                                            p: 1.2,
                                            mb: 1,
                                            borderRadius: 2,
                                            backgroundColor: rupture ? "rgba(239,68,68,0.07)" : "rgba(251,191,36,0.07)",
                                            border: `1px solid ${rupture ? "rgba(239,68,68,0.30)" : "rgba(251,191,36,0.30)"}`
                                        }}
                                    >
                                        <Typography sx={{ color: rupture ? "#FB7185" : "#FBBF24", fontWeight: 700, fontSize: 12 }}>
                                            {alerte.produit?.nom || alerte.nom || "Produit"}
                                        </Typography>

                                        <Typography sx={{ color: "#64748B", fontSize: 10, mb: 0.8 }}>
                                            Stock : {stock} • Seuil : {seuil}
                                        </Typography>

                                        <LinearProgress
                                            variant="determinate"
                                            value={pourcentage}
                                            sx={{
                                                height: 4,
                                                borderRadius: 5,
                                                backgroundColor: "#263244",
                                                "& .MuiLinearProgress-bar": {
                                                    backgroundColor: rupture ? "#FB7185" : "#FBBF24",
                                                    borderRadius: 5
                                                }
                                            }}
                                        />
                                    </Box>
                                );
                            })
                        ) : (
                            <Box sx={{ py: 3, textAlign: "center" }}>
                                <Warning sx={{ color: "#64748B", fontSize: 30, mb: 0.5 }} />
                                <Typography sx={{ color: "#64748B", fontSize: 12 }}>
                                    {produitsRupture > 0 ? `${produitsRupture} produit(s) en rupture` : "Aucune alerte stock"}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default Dashboard;