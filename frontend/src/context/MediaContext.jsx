import { createContext, useState, useEffect } from "react";
import { fetchVideos, fetchPDFs, fetchAudios } from "../api/mediaApi";
import React from "react";
export const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [pdfs, setPDFs] = useState([]);
  const [audios, setAudios] = useState([]);

  useEffect(() => {
    fetchVideos().then((res) => setVideos(res.data));
    fetchPDFs().then((res) => setPDFs(res.data));
    fetchAudios().then((res) => setAudios(res.data));
  }, []);

  return (
    <MediaContext.Provider value={{ videos, pdfs, audios }}>
      {children}
    </MediaContext.Provider>
  );
};
