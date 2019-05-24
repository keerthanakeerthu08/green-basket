import { apiUrl } from "../config.json";

import http from './httpService';


// http://192.168.1.46:7000/configuration?configName=charge limit

export function getConfig() {
  const apiEndPoint = `${apiUrl}/configuration`;
  return http.get(`${apiEndPoint}`);
}

export function getConfigName() {
  const apiEndPoint = `${apiUrl}/configuration?configName=charge limit`;
  return http.get(`${apiEndPoint}`); 
}

export function getDeliverHour() {
  const apiEndPoint = `${apiUrl}/configuration?configName=delivery hour`;
  return http.get(`${apiEndPoint}`); 
}

export function putConfig(data) {
  const apiEndPoint = `${apiUrl}/configuration`;
  return http.put(`${apiEndPoint}`, data);
}

export function postConfig(data) {
  const apiEndPoint = `${apiUrl}/configuration`;
  return http.post(`${apiEndPoint}`, data);
}

