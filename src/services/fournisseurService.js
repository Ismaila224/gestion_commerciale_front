import api from "./api";

export const getFournisseurs = async () => {
    const response = await api.get("/fournisseurs");
    return response.data.data ?? response.data;
};

export const createFournisseur = async (data) => {
    const response = await api.post("/fournisseurs", data);
    return response.data.data ?? response.data;
};

export const updateFournisseur = async (id, data) => {
    const response = await api.put(`/fournisseurs/${id}`, data);
    return response.data.data ?? response.data;
};

export const deleteFournisseur = async (id) => {
    return await api.delete(`/fournisseurs/${id}`);
 
};