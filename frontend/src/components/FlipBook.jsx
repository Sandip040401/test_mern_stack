import React, { useEffect, useState } from "react";
import axios from "axios";
import { GiKangaroo } from "react-icons/gi"; // Kangaroo for slow speed (0.5x)
import { FaRunning } from "react-icons/fa"; // Human running for normal speed (1x)
import { FaHorseHead } from "react-icons/fa"; // Horse for fast speed (1.5x)

const FlipBook = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [wordsData, setWordsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [audioSpeed, setAudioSpeed] = useState(1); // Default speed is 1x
  let currentAudio = null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alphabetRes = await axios.get("http://localhost:5000/api/alphabets");
        const alphabetList = alphabetRes.data;
        setAlphabets(alphabetList);

        const wordRequests = alphabetList.map((alphabet) =>
          axios.get(`http://localhost:5000/api/alphabets/${alphabet._id}/words`)
        );

        const responses = await Promise.all(wordRequests);

        const wordsObj = responses.reduce((acc, response, idx) => {
          acc[alphabetList[idx]._id] = Array.isArray(response.data.words) ? response.data.words : [];
          return acc;
        }, {});

        setWordsData(wordsObj);

        if (alphabetList.length > 0 && wordsObj[alphabetList[0]._id]?.length > 0) {
          setSelectedWord(wordsObj[alphabetList[0]._id][0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  const playAudio = (audioSrc, speed = 1) => {
    if (!audioSrc) return;
    if (currentAudio) {
      currentAudio.pause();
    }
    currentAudio = new Audio(audioSrc);
    currentAudio.playbackRate = speed;
    currentAudio.play();
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
  };

  const totalPages = alphabets.length;
  const isLastPage = currentPage >= totalPages - 1;

  const nextPage = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
      const newAlphabetId = alphabets[currentPage + 1]?._id;
      if (newAlphabetId && wordsData[newAlphabetId]?.length > 0) {
        setSelectedWord(wordsData[newAlphabetId][0]);
      } else {
        setSelectedWord(null);
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      const newAlphabetId = alphabets[currentPage - 1]?._id;
      if (newAlphabetId && wordsData[newAlphabetId]?.length > 0) {
        setSelectedWord(wordsData[newAlphabetId][0]);
      } else {
        setSelectedWord(null);
      }
    }
  };

  if (loading) return <div className="text-center mt-10 text-xl">Loading...</div>;

  return (
    <div className="flex justify-center items-center h-screen bg-blue-300">
      <div className="relative w-[900px] h-[550px] bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col border-4 border-blue-400">
        
        {/* Flipbook Content */}
        {alphabets.map(({ _id, letter }, index) => {
          if (currentPage === index) {
            return (
              <div key={_id} className="flex-grow flex">
                {/* Left Side - Word List */}
                <div className="w-1/2 p-6 bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('background.png')" }}>
                  <h2 className="text-2xl font-bold text-blue-700 mb-4 border-b-2 pb-2">
                    Word Family - /{letter}/ words
                  </h2>
                  <div className="space-y-3 overflow-y-auto max-h-[400px]">
                    {wordsData[_id]?.map((word, idx) => (
                      <div key={idx} className="flex items-center justify-between space-x-2">
                        <button
                          onClick={() => playAudio(word.audio)}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-green-200 transition rotate-180"
                        >
                          🔊
                        </button>
                        <button
                          onClick={() => handleWordClick(word)}
                          className={`text-lg p-2 rounded-lg shadow-md w-40 text-center ${
                            selectedWord?.word === word.word ? "bg-green-700 text-white" : "bg-green-500 text-white"
                          }`}
                        >
                          {word.word}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Sentence and Speed Control */}
                <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-cover bg-center text-center relative" style={{ backgroundImage: "url('right.png')" }}>
                  {selectedWord && (
                    <div className="mt-6 text-center">
                      <p className="text-lg font-semibold text-gray-800">{selectedWord.sentence}</p>
                      {selectedWord.sentenceAudio && (
                        <button
                          onClick={() => playAudio(selectedWord.sentenceAudio, audioSpeed)}
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                          🔊 Play Sentence
                        </button>
                      )}
                    </div>
                  )}

                  {/* Speed Control Icons */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-3">
                    <button
                      onClick={() => setAudioSpeed(0.5)}
                      className={`p-2 rounded-full shadow-md text-white ${
                        audioSpeed === 0.5 ? "bg-green-600" : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      <GiKangaroo size={25} />
                    </button>
                    <button
                      onClick={() => setAudioSpeed(1)}
                      className={`p-2 rounded-full shadow-md text-white ${
                        audioSpeed === 1 ? "bg-green-600" : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      <FaRunning size={25} />
                    </button>
                    <button
                      onClick={() => setAudioSpeed(1.5)}
                      className={`p-2 rounded-full shadow-md text-white ${
                        audioSpeed === 1.5 ? "bg-green-600" : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      <FaHorseHead size={25} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center bg-gray-200 p-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md disabled:bg-gray-400"
          >
            ⬅️ Previous
          </button>
          <span className="text-lg font-semibold">Page {currentPage + 1} / {totalPages}</span>
          <button
            onClick={nextPage}
            disabled={isLastPage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md disabled:bg-gray-400"
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlipBook;
