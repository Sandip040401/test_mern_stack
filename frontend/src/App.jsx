import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import PDFs from "./pages/PDFs";
import Audios from "./pages/Audios";
import WebGL from "./pages/WebGL";
import Sidebar from "./components/Sidebar";
import React from 'react'

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="w-full p-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/pdfs" element={<PDFs />} />
            <Route path="/audios" element={<Audios />} />
            <Route path="/webgl" element={<WebGL />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
