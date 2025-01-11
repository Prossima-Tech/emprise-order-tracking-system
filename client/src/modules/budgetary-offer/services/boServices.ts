import axios from 'axios';

const API_URL = '/api/v1/budgetary-offers';
import { mockBOService } from '../utils/dummyData'

export const boService = mockBOService;


// export const boService = {
//   async createOffer(data: any) {
//     const response = await axios.post(API_URL, data);
//     return response.data.data;
//   },

//   async updateOffer(id: string, data: any) {
//     const response = await axios.put(`${API_URL}/${id}`, data);
//     return response.data.data;
//   },

//   async getOffer(id: string) {
//     const response = await axios.get(`${API_URL}/${id}`);
//     return response.data.data;
//   },

//   async listOffers(params: any) {
//     const response = await axios.get(API_URL, { params });
//     return response.data;
//   },

//   async updateStatus(id: string, status: string) {
//     const response = await axios.patch(`${API_URL}/${id}/status`, { status });
//     return response.data.data;
//   },

//   async getStatistics(params?: any) {
//     const response = await axios.get(`${API_URL}/statistics`, { params });
//     return response.data.data;
//   },

//   async calculateValue(workItems: any[]) {
//     const response = await axios.post(`${API_URL}/calculate-value`, { workItems });
//     return response.data.data;
//   }
// };
