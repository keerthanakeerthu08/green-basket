import http from './httpService';
import { apiUrl } from "../config.json";

// Get specialoffers
export const getseasonbasket = () => {
  const apiEndPoint = `${apiUrl}/products`;
  return http.get(apiEndPoint)
}




