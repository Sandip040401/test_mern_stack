import { useState, useRef, useEffect } from "react";
import { fetchAudios, uploadAudio, renameAudio, getAudioUrl } from "../api/mediaApi";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioList, setAudioList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAudioName, setNewAudioName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    setLoading(true);
    try {
      const response = await fetchAudios();
      // Assuming the response.data contains an array of audio objects with filenames
      setAudioList(response.data.map(audio => ({
        ...audio,
        url: getAudioUrl(audio.filename) // Generate URL for each audio
      })));
    } catch (error) {
      console.error("Error fetching audios:", error);
    }
    setLoading(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 512;

    bufferLengthRef.current = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

    drawWaveform();

    mediaRecorderRef.current = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      setAudioUrl(URL.createObjectURL(audioBlob));
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    cancelAnimationFrame(animationRef.current);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.beginPath();

      let sliceWidth = (canvas.width * 1.0) / bufferLengthRef.current;
      let x = 0;

      for (let i = 0; i < bufferLengthRef.current; i++) {
        let v = dataArrayRef.current[i] / 128.0;
        let y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const saveAudio = async () => {
    if (!audioBlob) return;

    const audioFile = new File([audioBlob], "recorded-audio.wav", { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      await uploadAudio(formData);
      alert("Audio uploaded successfully");
      loadAudios(); // Reload the list of audios after upload
      setAudioBlob(null);
      setAudioUrl("");
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const handleRename = async (index) => {
    const oldFilename = audioList[index].filename;
    const newFilename = newAudioName || oldFilename; // Use the new name or fallback to the old one

    try {
      await renameAudio(oldFilename, newFilename);
      loadAudios(); // Reload the audio list after renaming
      setEditingIndex(null);
      setNewAudioName("");
    } catch (error) {
      console.error("Error renaming audio:", error);
    }
  };

  return (
    <div className="min-h-full text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-black text-center mb-6">🎙️ Audio Recorder</h2>

        {/* Waveform Visualizer */}
        <canvas ref={canvasRef} width={500} height={100} className="border border-gray-600 rounded-md w-full mb-4"></canvas>

        {/* Recording Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-lg font-medium transition text-black shadow-lg border border-gray-600 ${
              recording
                ? "bg-gray-800 hover:bg-gray-700 animate-pulse"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {recording ? "⏹ Stop Recording" : "🎤 Start Recording"}
          </button>
        </div>

        {/* Recorded Audio Preview */}
        {audioUrl && (
          <div className="mt-6 p-4 bg-gray-800 text-black rounded-lg shadow-md flex flex-col items-center border border-gray-700">
            <p className="text-lg font-semibold mb-2 text-white">🔊 Recorded Audio:</p>
            <audio controls src={audioUrl} className="w-full rounded-lg" />
            <button
              onClick={saveAudio}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500"
            >
              💾 Save to Database
            </button>
          </div>
        )}

        {/* Saved Audios Section */}
        <h3 className="mt-8 text-xl text-black font-semibold text-center">📂 Saved Audios</h3>

        <div className="mt-4 max-h-60 overflow-y-auto border border-gray-700 rounded-lg p-3">
          {loading ? (
            <p className="text-center text-gray-400">Loading audios...</p>
          ) : (
            <ul className="space-y-3">
              {audioList.length > 0 ? (
                audioList.map((audio, index) => (
                  <li
                    key={index}
                    className="bg-white text-black p-3 rounded-lg shadow-md flex items-center justify-between border border-gray-700"
                  >
                    <span className="text-sm font-medium">#{index + 1} 🎵 {editingIndex === index ? (
                      <input
                        type="text"
                        value={newAudioName}
                        onChange={(e) => setNewAudioName(e.target.value)}
                        className="border border-gray-600 rounded-md p-1 text-black"
                      />
                    ) : (
                      audio.filename
                    )}</span>
                    <audio controls src={audio.url} className="w-40 rounded-md" />

                    <div>
                      {editingIndex === index ? (
                        <button
                          onClick={() => handleRename(index)}
                          className="text-green-500 underline ml-2"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setNewAudioName(audio.filename);
                          }}
                          className="text-blue-500 underline ml-2"
                        >
                          Rename
                        </button>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-400 mt-2">No audios available.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
