import apiClient from "../../services/api/axios";

export async function getTAClaims(employeeId) {
  if (!employeeId) {
    throw new Error("Employee ID is required to load claims.");
  }

  const response = await apiClient.get(`/ta/claims/${employeeId}`);

  return response.data;
}