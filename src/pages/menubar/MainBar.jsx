import { useNavigate, useLocation } from "react-router-dom";
import { Avatar } from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";

import { useAuth } from "../../context/AuthContext";

function MainBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const role = user.role;
  const estAdmin = role === "admin";
  const estGestionnaire = role === "gestionnaire";

  // Fonction utilitaire pour générer le style dynamiquement (Page active + Hover)
  const getMenuItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "8px 12px",
      marginBottom: "4px",
      borderRadius: "6px",
      cursor: "pointer",
      color: isActive ? "#FFFFFF" : "#94A3B8",
      backgroundColor: isActive ? "#7C3AED" : "transparent",
      fontWeight: isActive ? "600" : "normal",
      transition: "all 0.2s ease-in-out",
    };
  };

  return (
    <div
      style={{
        backgroundColor: "#111827",
        color: "#94A3B8",
        width: "15%",
        minWidth: "220px",
        minHeight: "100vh",
        padding: "0 10px",
        boxSizing: "border-box",
        borderRight: "1px solid #1F2937",
      }}
    >
      {/* En-tête Profil / App */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "70px",
          gap: "10px",
          paddingLeft: "5px",
        }}
      >
        <Avatar sx={{ bgcolor: "#7C3AED" }}>
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>
            GesCom
          </h3>
          <h6 style={{ margin: 0, color: "#94A3B8", fontWeight: "normal" }}>
            Gestion commerciale
          </h6>
        </div>
      </div>

      <hr style={{ borderColor: "#1F2937", margin: "10px 0" }} />

      {/* Menu principal */}
      <div>
        <h5 style={{ color: "#64748B", paddingLeft: "12px", margin: "12px 0 6px 0", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          ACCUEIL
        </h5>
        <div style={getMenuItemStyle("/dashboard")} onClick={() => navigate("/dashboard")}>
          <DashboardIcon fontSize="small" />
          <span>Dashboard</span>
        </div>

        <h5 style={{ color: "#64748B", paddingLeft: "12px", margin: "12px 0 6px 0", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          RÉFÉRENTIEL
        </h5>
        <div style={getMenuItemStyle("/categories")} onClick={() => navigate("/categories")}>
          <CategoryIcon fontSize="small" />
          <span>Catégories</span>
        </div>
        <div style={getMenuItemStyle("/clients")} onClick={() => navigate("/clients")}>
          <PeopleIcon fontSize="small" />
          <span>Clients</span>
        </div>
        {(estAdmin || estGestionnaire) && (
          <div style={getMenuItemStyle("/fournisseurs")} onClick={() => navigate("/fournisseurs")}>
            <LocalShippingIcon fontSize="small" />
            <span>Fournisseurs</span>
          </div>
        )}
        <div style={getMenuItemStyle("/produits")} onClick={() => navigate("/produits")}>
          <InventoryIcon fontSize="small" />
          <span>Produits</span>
        </div>

        <h5 style={{ color: "#64748B", paddingLeft: "12px", margin: "12px 0 6px 0", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          COMMERCE
        </h5>
        <div style={getMenuItemStyle("/ventes")} onClick={() => navigate("/ventes")}>
          <ShoppingCartIcon fontSize="small" />
          <span>Ventes</span>
        </div>
        {(estAdmin || estGestionnaire) && (
          <div style={getMenuItemStyle("/approvisionnements")} onClick={() => navigate("/approvisionnements")}>
            <AssignmentIcon fontSize="small" />
            <span>Approvisionnements</span>
          </div>
        )}
        <div style={getMenuItemStyle("/paiements")} onClick={() => navigate("/paiements")}>
          <PaymentIcon fontSize="small" />
          <span>Paiements</span>
        </div>

        <h5 style={{ color: "#64748B", paddingLeft: "12px", margin: "12px 0 6px 0", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          STOCK
        </h5>
        {(estAdmin || estGestionnaire) && (
          <div style={getMenuItemStyle("/mouvements-stock")} onClick={() => navigate("/mouvements-stock")}>
            <SwapHorizIcon fontSize="small" />
            <span>Mouvements</span>
          </div>
        )}
      </div>

      <hr style={{ borderColor: "#1F2937", margin: "15px 0" }} />

      {/* Footer / Paramètres */}
      <div style={getMenuItemStyle("/profile")} onClick={() => navigate("/profile")}>
        <PersonIcon fontSize="small" />
        <span>Profil</span>
      </div>

      {estAdmin && (
        <div style={getMenuItemStyle("/utilisateurs")} onClick={() => navigate("/utilisateurs")}>
          <SettingsIcon fontSize="small" />
          <span>Paramètres</span>
        </div>
      )}
    </div>
  );
}

export default MainBar;