import http from './httpService';
import { apiUrl } from "../config.json";

export function addContactDetails(data) {
  const apiEndPoint = `${apiUrl}/contactDetails`;
  return http.post(`${apiEndPoint}`, data);
}

export const getContactList = () => {
  const apiEndPoint = `${apiUrl}/contactDetails`;
  return http.get(apiEndPoint)
}

export function updateContactDetails(data) {
  const apiEndPoint = `${apiUrl}/contactDetails`;
  return http.put(`${apiEndPoint}`, data);
}

export function deleteContactDetails(params) {
  const apiEndPoint = `${apiUrl}/contactDetails`;
  return http.delete(`${apiEndPoint}?${params}`);
}