import http from './httpService';
import { apiUrl } from "../config.json";




export function addFeedback(data) {
  const apiEndPoint = `${apiUrl}/feedback`;
  return http.post(`${apiEndPoint}`, data);
}




