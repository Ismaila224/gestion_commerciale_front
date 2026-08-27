import api from "./api";

export async function getApprovisionnements() {
    const response = await api.get("/approvisionnements");
    return response.data.data;
}

export async function deleteApprovisionnement(id) {
    await api.delete(`/approvisionnements/${id}`);
}

export async function createApprovisionnement(approvisionnementData) {
    const response = await api.post("/approvisionnements", approvisionnementData);
    return response.data;
}

export async function recevoirApprovisionnement(id) {
    const response = await api.patch(`/approvisionnements/${id}/recevoir`);
    return response.data;
}

export async function annulerApprovisionnement(id) {
    const response = await api.patch(`/approvisionnements/${id}/annuler`);
    return response.data;
}

export async function getApprovisionnement(id) {
    const response = await api.get(`/approvisionnements/${id}`);
    return response.data.data;
}
 
