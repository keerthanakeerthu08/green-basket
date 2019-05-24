import { apiUrl } from "../config.json";

import http from './httpService';

export const getAllOrders = () => {
  const apiEndPoint = `${apiUrl}/orders`;
  return http.get(apiEndPoint)
}

export const getOrderbyId = (params) => {
  const apiEndPoint = `${apiUrl}/orders?${params}`;
  return http.get(apiEndPoint)
}


export function updateOrders(data) {
  const apiEndPoint = `${apiUrl}/deliveryDetails`;
  return http.put(`${apiEndPoint}`, data);
}


export const placeOrder = (data) => {
  const apiEndPoint = `${apiUrl}/multiOrders`;
  return http.post(`${apiEndPoint}`, data);
}