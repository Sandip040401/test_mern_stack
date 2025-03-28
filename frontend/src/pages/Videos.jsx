import VideoPlayer from "../components/VideoPlayer";
import React from 'react'

const Videos = () => {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Video Library</h1>
      <VideoPlayer />
    </div>
  );
};

export default Videos;
