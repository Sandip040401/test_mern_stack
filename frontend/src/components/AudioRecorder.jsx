import { useState, useRef } from "react";
import React from 'react'

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      setAudioUrl(URL.createObjectURL(audioBlob));
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording} className="bg-blue-500 text-white px-4 py-2 rounded">
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioUrl && <audio controls src={audioUrl} className="mt-4" />}
    </div>
  );
};

export default AudioRecorder;
