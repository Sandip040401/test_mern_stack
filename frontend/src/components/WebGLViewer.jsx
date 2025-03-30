import React from "react";

const WebGLViewer = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className="w-full h-[80vh] border border-gray-300">
      {/* Update this URL if deploying */}
      <iframe
        src={`${API_URL}/webgl/index.html`}
        title="WebGL Viewer"
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default WebGLViewer;
