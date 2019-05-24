import { apiUrl } from "../config.json";

import http from './httpService';

export const getFeedbacks = () => {
  const apiEndPoint = `${apiUrl}/feedback`;
  return http.get(apiEndPoint)
}

export const getUserDetails = () => {
  const apiEndPoint = `${apiUrl}/userDetails`;
  return http.get(apiEndPoint)
}
export function deleteUserDetails(params) {
  return http.delete(`${apiUrl}/userDetails?${params}`);
}
export function updateUserDetails(data) {
  const apiEndPoint = `${apiUrl}/userDetails`;
  return http.put(`${apiEndPoint}`, data);
}

export function deleteUserFeedback(params) {
  return http.delete(`${apiUrl}/feedback?${params}`);
}