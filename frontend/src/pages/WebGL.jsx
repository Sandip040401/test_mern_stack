import WebGLViewer from "../components/WebGLViewer";
import React from 'react'

const WebGL = () => {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">3D Model Viewer</h1>
      <WebGLViewer />
    </div>
  );
};

export default WebGL;
