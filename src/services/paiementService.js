import api from "./api";

export const getPaiements = async () => {
  const response = await api.get("/paiements");
  return response.data.data; 
};