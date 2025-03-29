import React, { useEffect, useState } from "react";
import { fetchPDFs, getPDFUrl, uploadPDF, updatePDFName } from "../api/mediaApi";
import PDFModal from "./PDFModal"; // Import the PDFModal component

const PDFViewer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfWidth, setPdfWidth] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newPdfName, setNewPdfName] = useState("");

  useEffect(() => {
    fetchPDFs()
      .then((res) => setPdfs(res.data))
      .catch((err) => console.error("Error fetching PDFs:", err));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setIsModalOpen(true);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("No file selected!");

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const res = await uploadPDF(formData);
      alert("Upload successful!");
      setSelectedFile(null);
      setPdfs([...pdfs, res.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
  };

  const openModalForPdf = (pdf) => {
    setSelectedPdf(pdf);
    setIsModalOpen(true);
    setCurrentPage(1);
  };

  const handleEditName = (index) => {
    setEditingIndex(index);
    setNewPdfName(pdfs[index].filename);
  };

  const savePdfName = async (index) => {
    const oldFilename = pdfs[index].filename;
    const newFilename = newPdfName;
  
    try {
      const response = await updatePDFName(oldFilename, newFilename);
      alert("Rename Successful");
      const updatedPdfs = [...pdfs];
      updatedPdfs[index].filename = newFilename;
      setPdfs(updatedPdfs);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error updating PDF name:", error);
      alert("Failed to update PDF name.");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewPdfName("");
  };

// Function to open the PDF in a new tab
const downloadFullPDF = (pdf) => {
  const url = getPDFUrl(pdf.filename); // Get the URL for the PDF
  window.open(url, "_blank"); // Open the PDF URL in a new tab
};

  return (
    <div className="p-4">
      <div className="mb-6 border p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg">Upload a PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mt-2"
        />
      </div>

      <PDFModal
        isOpen={isModalOpen}
        selectedFile={selectedFile}
        selectedPdf={selectedPdf}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        numPages={numPages}
        setNumPages={setNumPages}
        pdfWidth={pdfWidth}
        setPdfWidth={setPdfWidth}
      />

      <h2 className="font-bold text-lg mb-4">Saved PDFs</h2>
      {pdfs.length === 0 ? (
        <p>No PDFs uploaded yet.</p>
      ) : (
        pdfs.map((pdf, index) => (
          <div key={pdf.filename} className="mb-4 border p-4 rounded-lg shadow flex items-center justify-between">
            <h3 className="font-semibold">
              {index + 1}. {editingIndex === index ? (
                <input
                  type="text"
                  value={newPdfName}
                  onChange={(e) => setNewPdfName(e.target.value)}
                  className="border p-1 rounded"
                />
              ) : (
                pdf.filename
              )}
            </h3>
            <div>
              {editingIndex === index ? (
                <>
                  <button onClick={() => savePdfName(index)} className="text-green-500 underline mr-2">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="text-red-500 underline mr-2">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => handleEditName(index)} className="text-blue-500 underline mr-2">
                  Edit
                </button>
              )}
              <button onClick={() => openModalForPdf(pdf)} className="text-blue-500 underline mr-2">
                View PDF
              </button>
              <button onClick={() => downloadFullPDF(pdf)} className="text-blue-500 underline">
                Download Full PDF
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PDFViewer;
