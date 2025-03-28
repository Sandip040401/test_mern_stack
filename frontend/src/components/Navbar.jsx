import { Link } from "react-router-dom";
import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">MERN MediaHub</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-yellow-400">Home</Link>
        <Link to="/videos" className="hover:text-yellow-400">Videos</Link>
        <Link to="/pdfs" className="hover:text-yellow-400">PDFs</Link>
        <Link to="/audios" className="hover:text-yellow-400">Audios</Link>
        <Link to="/webgl" className="hover:text-yellow-400">WebGL</Link>
      </div>
    </nav>
  );
};

export default Navbar;
