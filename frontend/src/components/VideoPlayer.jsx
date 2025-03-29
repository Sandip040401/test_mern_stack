import React, { useEffect, useState, useCallback } from "react";
import { fetchVideos, getVideoUrl } from "../api/mediaApi";
import ReactPlayer from "react-player";
import axios from "axios";

const VideoPlayer = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [playing, setPlaying] = useState(false); // Controls auto-play

  // Fetch videos from API
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetchVideos();
        setVideos(response.data);
        if (response.data.length > 0) {
          setSelectedVideo(response.data[0].filename);
          setPlaying(true); // Auto-play first video
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
    setPlaying(true); // Auto-play when selected
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewVideo(URL.createObjectURL(file));
      setSelectedFile(file);
      setPlaying(true); // Auto-play preview
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("video", selectedFile);

    setUploading(true);
    try {
      await axios.post("http://localhost:5000/api/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Video uploaded successfully!");
      window.location.reload(); // Refresh to fetch updated videos
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload video");
    }
    setUploading(false);
    setPreviewVideo(null);
    setSelectedFile(null);
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setPreviewVideo(null);
    setSelectedFile(null);
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
    </div>
  );
};

export default VideoPlayer;
