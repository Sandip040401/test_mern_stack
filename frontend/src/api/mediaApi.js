import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Fetch all media files
export const fetchVideos = () => axios.get(`${API_URL}/videos`);
export const fetchPDFs = () => axios.get(`${API_URL}/pdfs`);
export const fetchAudios = () => axios.get(`${API_URL}/audios`);
export const fetchWebGL = () => axios.get(`${API_URL}/webgl`);

// Upload functions
export const uploadAudio = (data) => axios.post(`${API_URL}/audios/upload`, data);
export const uploadPDF = (data) => axios.post(`${API_URL}/pdfs/upload`, data);


// update functions
export const updatePDFName = async (oldFilename, newFilename) => {
    const response = await axios.put(`${API_URL}/pdfs/rename`, {
      oldFilename,
      newFilename,
    });
    return response.data; // Return the response data
  };

// Rename audio file
export const renameAudio = (oldFilename, newFilename) => 
    axios.put(`${API_URL}/audios/update`, { oldFilename, newFilename });

// Generate media streaming URLs
export const getVideoUrl = (filename) => `${API_URL}/videos/${filename}`;
export const getPDFUrl = (filename) => `${API_URL}/pdfs/${filename}`;
export const getAudioUrl = (filename) => `${API_URL}/audios/${filename}`;
export const getWebGLUrl = (filename) => `${API_URL}/webgl/${filename}`;
