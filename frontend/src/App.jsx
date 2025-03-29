import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import PDFs from "./pages/PDFs";
import Audios from "./pages/Audios";
import WebGL from "./pages/WebGL";
import React from "react";
import { HomeLayout } from "./layout/HomeLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="videos" element={<Videos />} />
          <Route path="pdfs" element={<PDFs />} />
          <Route path="audios" element={<Audios />} />
          <Route path="webgl" element={<WebGL />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
