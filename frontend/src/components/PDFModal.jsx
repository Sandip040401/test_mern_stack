import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { getPDFUrl } from "../api/mediaApi";
import { jsPDF } from "jspdf"; // Import jsPDF
import "pdfjs-dist/build/pdf.worker.min.mjs";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set the worker source manually
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

const PDFModal = ({
  isOpen,
  selectedFile,
  selectedPdf,
  onClose,
  onUpload,
  currentPage,
  setCurrentPage,
  numPages,
  setNumPages,
  pdfWidth,
  setPdfWidth,
}) => {
  if (!isOpen) return null;

  const downloadPage = async () => {
    // Load the PDF document
    const pdfDoc = await pdfjs.getDocument(selectedFile || getPDFUrl(selectedPdf.filename)).promise;
    const page = await pdfDoc.getPage(currentPage);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set the desired scale for high-quality rendering
    const scale = 2; // Adjust this scale for better quality
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page into the canvas context
    await page.render({ canvasContext: context, viewport }).promise;

    // Generate the PDF from the canvas
    const pdf = new jsPDF({
      orientation: "portrait", // Change orientation if needed
      unit: "pt",              // Use points for consistent sizing
      format: [viewport.width, viewport.height], // Set the format to the page size
      putOnlyUsedFonts: true,
      floatPrecision: 16       // Precision for floating point
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, viewport.width, viewport.height); // Full-size image
    pdf.save(`page_${currentPage}.pdf`); // Save the PDF with the current page number
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
        <h3 className="font-bold text-lg mb-2">Preview PDF</h3>

        <div className="overflow-auto flex-grow max-h-[70vh] border p-2">
          <Document
            file={selectedFile || getPDFUrl(selectedPdf.filename)}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <Page
              pageNumber={currentPage}
              onLoadSuccess={(page) => setPdfWidth(page.originalWidth)}
            />
          </Document>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-lg">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numPages))}
            disabled={currentPage === numPages}
            className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={downloadPage} // Add download button functionality
            className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
          >
            Download Current Page
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-3 py-1 rounded mr-2"
          >
            Close
          </button>
          <button onClick={onUpload} className="bg-green-500 text-white px-3 py-1 rounded">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFModal;
