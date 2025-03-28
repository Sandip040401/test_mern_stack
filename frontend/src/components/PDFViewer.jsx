import { useEffect, useState } from "react";
import { fetchPDFs } from "../api/mediaApi";
import { Document, Page, pdfjs } from "react-pdf";
import React from 'react'


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = () => {
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    fetchPDFs().then((res) => setPdfs(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      {pdfs.map((pdf) => (
        <Document key={pdf._id} file={pdf.url}>
          {[...Array(10)].map((_, index) => (
            <Page key={index} pageNumber={index + 1} />
          ))}
        </Document>
      ))}
    </div>
  );
};

export default PDFViewer;
