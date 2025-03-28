import React from 'react'

const WebGLViewer = () => {
    return (
      <div className="w-full h-[80vh] border border-gray-300">
        <iframe
          src="http://localhost:5000/webgl/index.html"
          title="WebGL Viewer"
          className="w-full h-full"
        ></iframe>
      </div>
    );
  };
  
  export default WebGLViewer;
  