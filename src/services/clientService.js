import api from "./api";

export async function getClients() {
    const response = await api.get("/clients");
    return response.data.data;
}

export async function deleteClient(id) {
    await api.delete(`/clients/${id}`);
}

export async function createClient(data) { 
    const response = await api.post("/clients", data); 
    return response.data.data; 
}

export const updateClient = async (id, data) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data.data ?? response.data;
};
