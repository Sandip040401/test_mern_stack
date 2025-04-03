import React, { useEffect, useState } from "react";
import axios from "axios";

const FlipBook = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [wordsData, setWordsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  let currentAudio = null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alphabets
        const alphabetRes = await axios.get("http://localhost:5000/api/alphabets");
        const alphabetList = alphabetRes.data;
        setAlphabets(alphabetList);

        // Fetch words, sentence, and audio for each alphabet
        const wordRequests = alphabetList.map((alphabet) =>
          axios.get(`http://localhost:5000/api/alphabets/${alphabet._id}/words`)
        );

        const responses = await Promise.all(wordRequests);

        // Store data in correct format
        const wordsObj = responses.reduce((acc, response, idx) => {
          acc[alphabetList[idx]._id] = {
            words: Array.isArray(response.data.words) ? response.data.words : [],
            sentence: response.data.sentence || "",
            sentenceAudio: response.data.sentenceAudio || "",
          };
          return acc;
        }, {});

        setWordsData(wordsObj);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  const playAudio = (audioSrc) => {
    if (!audioSrc) return;
    if (currentAudio) {
      currentAudio.pause();
    }
    currentAudio = new Audio(audioSrc);
    currentAudio.play();
  };

  const totalPages = alphabets.length;
  const isLastPage = currentPage >= totalPages - 1;

  const nextPage = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <div className="text-center mt-10 text-xl">Loading...</div>;

  return (
    <div className="flex justify-center items-center h-screen bg-blue-300">
      <div className="relative w-[900px] h-[550px] bg-white shadow-2xl rounded-xl overflow-hidden flex border-4 border-blue-400">

        {alphabets.map(({ _id, letter }, index) => {
          if (currentPage === index) {
            return (
              <div key={_id} className="w-full h-full flex">
                {/* Left Side - Word List */}
                <div className="w-1/2 p-6 bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('background.png')" }}>
                  <h2 className="text-2xl font-bold text-blue-700 mb-4 border-b-2 pb-2">
                    Word Family - /{letter}/ words
                  </h2>
                  <div className="space-y-3 overflow-y-auto max-h-[400px]">
                    {(Array.isArray(wordsData[_id]?.words) ? wordsData[_id].words : []).map((word, idx) => (
                      <div key={idx} className="flex items-center justify-between ml-62 space-x-2">
                        <button
                          onClick={() => playAudio(word.audio)}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-green-200 transition rotate-180"
                        >
                          🔊
                        </button>
                        <span className="text-lg bg-green-500 text-white p-2 rounded-lg shadow-md w-40 text-center">
                          {word.word}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Sentence and Audio */}
                <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-cover bg-center text-center" style={{ backgroundImage: "url('right.png')" }}>
                  {/* Sentence */}
                  {wordsData[_id]?.sentence && (
                    <div className="mt-6 text-center">
                      <p className="text-lg font-semibold text-gray-800">{wordsData[_id].sentence}</p>
                      {wordsData[_id]?.sentenceAudio && (
                        <button
                          onClick={() => playAudio(wordsData[_id].sentenceAudio)}
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                          🔊 Play Sentence
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Navigation Buttons */}
        {currentPage > 0 && (
          <button
            onClick={prevPage}
            className="absolute bottom-4 left-4 bg-gray-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
          >
            ← Previous
          </button>
        )}

        {!isLastPage && (
          <button
            onClick={nextPage}
            className="absolute bottom-4 right-4 bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default FlipBook;
