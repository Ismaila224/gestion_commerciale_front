import api from "./api";

export async function getVentes() {
    const response = await api.get("/ventes");
    return response.data.data;
}

export async function getVente(id) {
    const response = await api.get(`/ventes/${id}`);
    return response.data.data;
}

export async function createVente(venteData) {
    const response = await api.post("/ventes", venteData);
    return response.data;
}

export async function deleteVente(id) {
    await api.delete(`/ventes/${id}`);
}

export async function annulerVente(id) {
    const response = await api.patch(`/ventes/${id}/annuler`);
    return response.data;
}

export async function ajouterPaiementVente(id, paiementData) {
    const response = await api.post(`/ventes/${id}/paiements`, paiementData);
    return response.data;
}

export const validerVente = async (id) => {
  const response = await api.patch(`/ventes/${id}/valider`);
  return response.data;
};



export const payerVente = async (payload) => {
  // payload = { vente_id, montant, mode, date_paiement, reference }
  const response = await api.post("/paiements", payload);
  return response.data;
};