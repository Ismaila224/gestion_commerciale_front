import api from "./api"; // Ton instance Axios configurée

export const getMouvementsStock = async () => {
  const response = await api.get("/mouvements-stock");
  return response.data;
};

export const getMouvementsParProduit = async (produitId) => {
  const response = await api.get(`/mouvements-stock/produit/${produitId}`);
  return response.data;
};