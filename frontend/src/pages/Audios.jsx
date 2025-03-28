import AudioRecorder from "../components/AudioRecorder";
import React from 'react'

const Audios = () => {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Audio Recorder</h1>
      <AudioRecorder />
    </div>
  );
};

export default Audios;
