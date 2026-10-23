
import apiClient from "../../services/api/axios";

export async function getTAClaims() {
  const response = await apiClient.get("/ta/claims/me");
  return response.data;
}
