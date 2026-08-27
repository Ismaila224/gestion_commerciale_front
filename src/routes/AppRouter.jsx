import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProduitList from "../pages/produits/ProduitList";
import ClientList from "../pages/clients/ClientList";
import FournisseurList from "../pages/fournisseurs/FournisseurList";
import VenteList from "../pages/ventes/VenteList";
import FormVente from "../pages/ventes/FormVente";
import UtilisateurList from "../pages/utilisateurs/UtilisateurList";
import Profile from "../pages/profile/Profile";
import ApproList from "../pages/approvisionnements/ApproList";
import FormAppro from "../pages/approvisionnements/FormAppro";
import CategorieList from "../pages/categories/CategorieList";
import Register from "../pages/auth/Register";
import PaiementList from "../pages/payement/PayementList";
import MouvementStockList from "../pages/stocks/MouvementStockList";
import Facture from "../pages/ventes/Facture";

import RoleRoute from "./RoleRoute";
import MainBar from "../pages/menubar/MainBar";

import { useAuth } from "../context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const pagesPubliques = [
      "/",
      "/login",
      "/register"
  ];

  const afficherMainBar =
      isAuthenticated &&
      !pagesPubliques.includes(location.pathname);

  return (
      <>
          <div style={{ display: "flex" }}>

              {afficherMainBar && <MainBar />}

              <div
                  style={{
                      width: afficherMainBar ? "81%" : "100%",
                      marginLeft: afficherMainBar ? "2%" : "0",
                      marginTop: 35
                  }}
              >

                  <Routes>

                      <Route
                          path="/"
                          element={<Login />}
                      />

                      <Route
                          path="/login"
                          element={<Login />}
                      />
                      <Route
                          path="/register"
                          element={<Register />}
                      />

                      <Route
                          path="/dashboard"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <Dashboard />
                              </RoleRoute>
                          }
                      />
                      <Route path="/factures/:id" element={<Facture />} />

                      <Route
                          path="/categories"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <CategorieList />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/clients"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <ClientList />
                              </RoleRoute>
                          }
                      />

                      <Route
                        path="/mouvements-stock"
                        element={
                        <RoleRoute roles={["admin", "gestionnaire"]}>
                            <MouvementStockList />
                                </RoleRoute>
                            }
                        />

                      <Route
                          path="/fournisseurs"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire"
                                  ]}
                              >
                                  <FournisseurList />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/produits"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <ProduitList />
                              </RoleRoute>
                          }
                      />

                      {/* 👈 2. Composant corrigé ici */}
                      <Route
                          path="/paiements"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <PaiementList />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/ventes"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <VenteList />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/ventes/new"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <FormVente />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/ventes/:id"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <FormVente />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/approvisionnements"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire"
                                  ]}
                              >
                                  <ApproList />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/approvisionnements/new"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire"
                                  ]}
                              >
                                  <FormAppro />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/approvisionnements/:id"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire"
                                  ]}
                              >
                                  <FormAppro />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/utilisateurs"
                          element={
                              <RoleRoute
                                  roles={["admin"]}
                              >
                                  <UtilisateurList />
                              </RoleRoute>
                          }
                      />

                      <Route
                          path="/profile"
                          element={
                              <RoleRoute
                                  roles={[
                                      "admin",
                                      "gestionnaire",
                                      "vendeur"
                                  ]}
                              >
                                  <Profile />
                              </RoleRoute>
                          }
                      />

                  </Routes>

              </div>
          </div>

          <ToastContainer
              position="top-right"
              autoClose={3000}
              theme="dark"
          />
      </>
  );
}

function AppRouter() {
  return (
      <BrowserRouter>
          <AppContent />
      </BrowserRouter>
  );
}

export default AppRouter;