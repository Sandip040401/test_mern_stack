import { Link } from "react-router-dom";
import { FiHome, FiVideo, FiFileText, FiMusic, FiGrid, FiMenu, FiX } from "react-icons/fi";
import React from "react";

const Sidebar = ({ isOpen, setIsOpen }) => {
    return (
        <div className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4">
                {isOpen && <h2 className="text-lg font-bold">MERN MediaHub</h2>}
                <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-4 flex-1">
                <ul className="space-y-2">
                    <li>
                        <Link to="/" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiHome size={20} />
                            {isOpen && <span>Home</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/videos" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiVideo size={20} />
                            {isOpen && <span>Videos</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/pdfs" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiFileText size={20} />
                            {isOpen && <span>PDFs</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/audios" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiMusic size={20} />
                            {isOpen && <span>Audio Recorder</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/webgl" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiGrid size={20} />
                            {isOpen && <span>WebGL</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/flipbook" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiGrid size={20} />
                            {isOpen && <span>FlipBook</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 rounded">
                            <FiGrid size={20} />
                            {isOpen && <span>AdminPanel</span>}
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
