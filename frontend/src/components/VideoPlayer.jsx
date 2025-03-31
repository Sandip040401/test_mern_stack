import React, { useEffect, useState, useCallback } from "react";
import { fetchVideos, getVideoUrl } from "../api/mediaApi";
import ReactPlayer from "react-player";
import axios from "axios";
import { io } from "socket.io-client";

const VideoPlayer = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [socket, setSocket] = useState(null);

  // Fetch videos from API
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetchVideos();
        setVideos(response.data);
        if (response.data.length > 0) {
          setSelectedVideo(response.data[0].filename);
          setPlaying(true);
        }
      } catch (error) {
        console.error("Failed to load videos", error);
      }
    };
    loadVideos();
  }, []);

  // Handle video selection
  const handleVideoClick = useCallback((filename) => {
    setSelectedVideo(filename);
    setPreviewVideo(null);
    setSelectedFile(null);
    setPlaying(true);
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewVideo(URL.createObjectURL(file));
      setSelectedFile(file);
      setPlaying(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setProgress(0);
    setUploadComplete(false);
  
    const formData = new FormData();
    formData.append("video", selectedFile);
  
    // Initialize WebSocket connection
    const newSocket = io("ws://test-mern-stack-6jv4.onrender.com");
    setSocket(newSocket);
  
    newSocket.on("uploadProgress", (data) => {
      console.log("Upload Progress Data:", data); // Debugging log
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
    });
  
    newSocket.on("processingProgress", (data) => {
      console.log("Processing Progress Data:", data); // Debugging log
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      if (data.progress === 100) {
        setUploadComplete(true);
        newSocket.disconnect();
      }
    });
  
    try {
      await axios.post(`${API_URL}/videos/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log("Axios Upload Progress:", percentCompleted); // Debugging log
          setProgress(percentCompleted);
        },
      });
  
      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload video");
    } finally {
      setUploading(false);
      setPreviewVideo(null);
      setSelectedFile(null);
    }
  };
  
  // Handle cancel upload
  const handleCancelUpload = () => {
    if (socket) socket.disconnect();
    setPreviewVideo(null);
    setSelectedFile(null);
    setProgress(0);
    setUploadComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">🎥 Video Player</h2>

      {/* Video Player */}
      <div className="w-full mb-6">
        {previewVideo ? (
          <ReactPlayer url={previewVideo} playing={playing} controls width="100%" height="400px" className="rounded-lg shadow-lg" />
        ) : selectedVideo ? (
          <ReactPlayer url={getVideoUrl(selectedVideo)} playing={playing} controls width="100%" height="400px" className="rounded-lg shadow-lg" />
        ) : (
          <div className="text-center text-gray-500 py-6">No video selected</div>
        )}
      </div>

      {/* Video List */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📜 Video List</h3>
        {videos.length > 0 ? (
          <ul className="space-y-2">
            {videos.map((video, index) => (
              <li
                key={video._id || index}
                className={`p-2 rounded-md cursor-pointer transition ${
                  selectedVideo === video.filename ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"
                }`}
                onClick={() => handleVideoClick(video.filename)}
              >
                {index + 1}. {video.filename}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No videos available</p>
        )}
      </div>

      {/* Upload Section */}
      <div className="mt-6 flex flex-col items-center">
        {!previewVideo && !selectedFile ? (
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition">
            Select Video
            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="flex space-x-4 mt-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
              onClick={handleCancelUpload}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
{/* Progress Bar */}
{progress > 0 && (
  <div className="mt-6 w-full bg-gray-200 rounded-full overflow-hidden">
    <div
      className={`text-center text-white py-1 text-sm font-semibold ${
        uploadComplete ? "bg-blue-500" : "bg-green-600"
      }`}
      style={{
        width: `${progress}%`,
        transition: "width 0.5s ease-in-out", // Smooth animation with delay
      }}
    >
      {Math.round(progress)}% {/* Ensuring only the numeric progress is displayed */}
    </div>
  </div>
)}

    </div>
  );
};

export default VideoPlayer;
