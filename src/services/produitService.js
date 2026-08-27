import api from "./api";

export async function getProduits() {
    const response = await api.get("/produits");
    return response.data.data;
}

export async function deleteProduit(id) {
    await api.delete(`/produits/${id}`);
}

export async function createProduit(data) { 
    const response = await api.post("/produits", data); 
    return response.data.data; 
}

export const updateProduit = async (id, data) => {
    const response = await api.put(`/produits/${id}`, data);
    return response.data.data ?? response.data;
};
 
