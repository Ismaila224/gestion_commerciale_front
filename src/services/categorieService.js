import api from "./api";

export async function getCategories() {
    const response = await api.get("/categories");
    return response.data.data;
}

export async function deleteCategory(id) {
    await api.delete(`/categories/${id}`);
}
 
export async function createCategory(data) { 
    const response = await api.post("/categories", data); 
    return response.data.data; 
}

export const updateCategory = async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data ?? response.data;
};