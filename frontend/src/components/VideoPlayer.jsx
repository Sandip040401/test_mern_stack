import { useEffect, useState } from "react";
import { fetchVideos } from "../api/mediaApi";
import React from 'react'

const VideoPlayer = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos().then((res) => setVideos(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      {videos.map((video) => (
        <video key={video._id} controls className="w-full mb-4">
          <source src={video.url} type="video/mp4" />
        </video>
      ))}
    </div>
  );
};

export default VideoPlayer;
