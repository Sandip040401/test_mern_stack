import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import PDFs from "./pages/PDFs";
import Audios from "./pages/Audios";
import WebGL from "./pages/WebGL";
import React from "react";
import { HomeLayout } from "./layout/HomeLayout";
import FlipBook from "./components/FlipBook";
import AdminPanel from "./components/AdminPanel";

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
        <Route path="/flipbook" element={<FlipBook />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
