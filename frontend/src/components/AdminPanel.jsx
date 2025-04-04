import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [newAlphabet, setNewAlphabet] = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState(null);
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [newAudio, setNewAudio] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null); // For audio upload
  const [selectedWordName, setSelectedWordName] = useState(null); // For audio upload
  const [loadingWords, setLoadingWords] = useState(false);
  const [sentence, setSentence] = useState("");
  const [sentenceAudio, setSentenceAudio] = useState(null);
  const [existingSentence, setExistingSentence] = useState("");
  const [existingSentenceAudio, setExistingSentenceAudio] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/alphabets`)
      .then((res) => setAlphabets(res.data))
      .catch((err) => console.error("Error fetching alphabets", err));
  }, []);

  useEffect(() => {
    if (selectedAlphabet) {
      setLoadingWords(true);
      axios.get(`${API_URL}/alphabets/${selectedAlphabet._id}/words`)
        .then((res) => {
          setWords(res.data.words || []);
          setLoadingWords(false);
        })
        .catch((err) => {
          console.error("Error fetching words", err);
          setLoadingWords(false);
        });
    }
  }, [selectedAlphabet]);

  const addAlphabet = async () => {
    if (!newAlphabet) return alert("Enter an alphabet!");
    if (alphabets.some((alpha) => alpha.letter === newAlphabet.toUpperCase())) {
      return alert("Alphabet already exists!");
    }

    try {
      const res = await axios.post(`${API_URL}/alphabets`, { letter: newAlphabet.toUpperCase() });
      setAlphabets([...alphabets, res.data]);
      setNewAlphabet("");
    } catch (err) {
      console.error("Error adding alphabet", err);
    }
  };

  const addWord = async () => {
    if (!selectedAlphabet || !newWord) return alert("Select an alphabet and enter a word.");

    try {
      const res = await axios.post(`${API_URL}/alphabets/${selectedAlphabet._id}/words`, { word: newWord });
      setWords(res.data.words || []);
      setNewWord("");
    } catch (err) {
      console.error("Error adding word", err);
    }
  };

  const addAudio = async () => {
    if (!selectedAlphabet || !selectedWord || !newAudio) {
      return alert("Select an alphabet, a word, and upload an audio file.");
    }

    try {
      const formData = new FormData();
      formData.append("file", newAudio);

      await axios.post(`${API_URL}/alphabets/${selectedAlphabet._id}/words/${selectedWord}/audio`, formData);
      setNewAudio(null);
      alert("Audio added successfully!");
    } catch (err) {
      console.error("Error adding audio", err);
    }
  };



  const addSentence = async () => {
    if (!selectedAlphabet || !sentence) {
      return alert("Select an alphabet and enter a sentence.");
    }

    try {
      await axios.post(`${API_URL}/alphabets/${selectedAlphabet._id}/sentence/${selectedWord}`, { sentence });
      setExistingSentence(sentence);
      alert("Sentence added successfully!");
    } catch (err) {
      console.error("Error adding sentence", err);
    }
  };

  const uploadSentenceAudio = async () => {
    if (!selectedAlphabet || !sentenceAudio) {
      return alert("Select an alphabet and upload an audio file.");
    }

    try {
      const formData = new FormData();
      formData.append("file", sentenceAudio);

      await axios.post(`${API_URL}/alphabets/sentence/audio/${selectedAlphabet._id}/${selectedWord}`, formData);
      alert("Sentence audio uploaded successfully!");
    } catch (err) {
      console.error("Error uploading sentence audio", err);
    }
  };

  
  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>

      {/* Add Alphabet */}
      <div className="mt-5 p-5 bg-white shadow rounded">
        <h2 className="text-xl font-semibold">Add Alphabet</h2>
        <div className="flex space-x-3 mt-3">
          <input
            type="text"
            maxLength="1"
            value={newAlphabet}
            onChange={(e) => setNewAlphabet(e.target.value.toUpperCase())}
            className="border p-2 rounded w-20 text-center text-lg"
          />
          <button onClick={addAlphabet} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Alphabet
          </button>
        </div>
      </div>

      {/* Select Alphabet */}
      <div className="mt-5 p-5 bg-white shadow rounded">
        <h2 className="text-xl font-semibold">Select Alphabet</h2>
        <select
          className="border p-2 rounded w-full"
          onChange={(e) => {
            const selected = alphabets.find((alpha) => alpha._id === e.target.value);
            setSelectedAlphabet(selected);
          }}
        >
          <option value="">-- Select Alphabet --</option>
          {alphabets.map((alpha) => (
            <option key={alpha._id} value={alpha._id}>{alpha.letter}</option>
          ))}
        </select>
      </div>

      {/* Add Word */}
      {selectedAlphabet && (
        <div className="mt-5 p-5 bg-white shadow rounded">
          <h2 className="text-xl font-semibold">Add Word for {selectedAlphabet.letter}</h2>
          <div className="flex space-x-3 mt-3">
            <input
              type="text"
              placeholder="Enter word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button onClick={addWord} className="bg-blue-500 text-white px-4 py-2 rounded">
              Add Word
            </button>
          </div>
        </div>
      )}

      {/* Add Audio */}
      {selectedAlphabet && words.length > 0 && (
        <div className="mt-5 p-5 bg-white shadow rounded">
          <h2 className="text-xl font-semibold">Add Audio</h2>
          <select
            className="border p-2 rounded w-full"
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedWordObj = words.find((word) => word._id === selectedId);
              setSelectedWord(selectedId);
              setSelectedWordName(selectedWordObj);
            }}
          >
            <option value="">-- Select Word --</option>
            {words.map((word) => (
              <option key={word._id} value={word._id}>{word.word}</option>
            ))}
          </select>

          <div className="flex space-x-3 mt-3">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setNewAudio(e.target.files[0])}
              className="border p-2 rounded"
            />
            <button onClick={addAudio} className="bg-blue-500 text-white px-4 py-2 rounded">
              Upload Audio
            </button>
          </div>
        </div>
      )}

      {selectedWord && (
        <div className="mt-3">
          {/* If the selected word has a sentence, show only the audio upload option */}
          {selectedWordName.sentence ? (
            <div className="mt-3">
              <p className="text-lg font-semibold">Sentence: {selectedWordName.sentence}</p>
              <div className="flex space-x-3 mt-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSentenceAudio(e.target.files[0])}
                  className="border p-2 rounded"
                />
                <button 
                  onClick={uploadSentenceAudio} 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Upload Audio
                </button>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                className="border p-2 rounded w-full"
                placeholder="Enter a sentence for the selected word"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
              ></textarea>

              {/* Show Save Sentence button */}
              {sentence.trim() && (
                <button 
                  onClick={addSentence} 
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
                >
                  Save Sentence
                </button>
              )}
            </div>
          )}
        </div>
      )}


      {/* Words Table */}
      {selectedAlphabet && words.length > 0 && (
        <div className="mt-5 p-5 bg-white shadow rounded">
          <h2 className="text-xl font-semibold">Words for {selectedAlphabet.letter}</h2>
          <table className="w-full mt-3 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Word</th>
                <th className="border p-2">Audio</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word._id} className="text-center">
                  <td className="border p-2">{word.word}</td>
                  <td className="border p-2">
                    {word.audio ? <audio controls src={word.audio} /> : "No Audio"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
