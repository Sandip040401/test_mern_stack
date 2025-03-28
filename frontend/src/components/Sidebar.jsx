import { Link } from "react-router-dom";
import React from 'react'

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-gray-800 text-white p-5">
      <h2 className="text-xl font-bold mb-5">MERN MediaHub</h2>
      <ul>
        <li className="mb-2"><Link to="/" className="block p-2 hover:bg-gray-700">Home</Link></li>
        <li className="mb-2"><Link to="/videos" className="block p-2 hover:bg-gray-700">Videos</Link></li>
        <li className="mb-2"><Link to="/pdfs" className="block p-2 hover:bg-gray-700">PDFs</Link></li>
        <li className="mb-2"><Link to="/audios" className="block p-2 hover:bg-gray-700">Audios</Link></li>
        <li className="mb-2"><Link to="/webgl" className="block p-2 hover:bg-gray-700">WebGL</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
