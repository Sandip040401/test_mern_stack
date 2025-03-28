import axios from "axios";

const API_URL = "http://localhost:5000/api/media";

export const fetchVideos = () => axios.get(`${API_URL}/videos`);
export const fetchPDFs = () => axios.get(`${API_URL}/pdfs`);
export const fetchAudios = () => axios.get(`${API_URL}/audios`);
export const uploadAudio = (data) => axios.post(`${API_URL}/audios`, data);
export const fetchWebGL = () => axios.get(`${API_URL}/webgl`);
