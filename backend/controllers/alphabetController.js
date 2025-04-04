import Alphabet from "../models/Alphabet.js";
import { getBucket } from "../config/db.js";
import mongoose from "mongoose";

// ✅ Create Alphabet (A-Z)
const createAlphabet = async (req, res) => {
  try {
    const { letter } = req.body;
    const alphabet = new Alphabet({ letter, words: [] });
    await alphabet.save();
    res.status(201).json(alphabet);
  } catch (error) {
    res.status(500).json({ message: "Error creating alphabet" });
  }
};

// ✅ Add Word to an Alphabet
const addWord = async (req, res) => {
  try {
    const { alphabet } = req.params;
    const { word } = req.body;
    
    const alphabetEntry = await Alphabet.findById({_id:alphabet});
    if (!alphabetEntry) return res.status(404).json({ message: "Alphabet not found" });

    alphabetEntry.words.push({ word });
    await alphabetEntry.save();

    res.status(201).json(alphabetEntry);
  } catch (error) {
    res.status(500).json({ message: "Error adding word" });
  }
};

// ✅ Upload Audio for a Word
const uploadAudio = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const { alphabet, word } = req.params;
    const bucket = getBucket("audios");
    
    // Find Alphabet & Word
    const alphabetEntry = await Alphabet.findById({ _id: alphabet });
    if (!alphabetEntry) return res.status(404).json({ message: "Alphabet not found" });
    
    const wordEntry = alphabetEntry.words.find(w => w._id.toString() === word);
    if (!wordEntry) return res.status(404).json({ message: "Word not found" });
    
    // Upload Audio to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.write(req.file.buffer);
    uploadStream.end();

    uploadStream.on("finish", async () => {
      wordEntry.audioFileId = uploadStream.id;
      await alphabetEntry.save();
      res.status(201).json({ message: "Audio uploaded", fileId: uploadStream.id });
    });

  } catch (error) {
    res.status(500).json({ message: "Audio upload failed" });
  }
};

// ✅ Get All Alphabets
const getAlphabets = async (req, res) => {
  try {
    const alphabets = await Alphabet.find();
    res.json(alphabets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alphabets" });
  }
};

// const getWordsByAlphabet = async (req, res) => {
//   try {
//     const { alphabet } = req.params;
//     const bucket = getBucket("audios");

//     // Fetch the alphabet entry
//     const alphabetEntry = await Alphabet.findById(alphabet);

//     if (!alphabetEntry) {
//       return res.status(404).json({ message: "Alphabet not found" });
//     }


//     // Process words and fetch audio files
//     const wordsWithAudio = await Promise.all(alphabetEntry.words.map(async (word) => {
//       if (!word.audioFileId) {
//         return { _id: word._id, word: word.word, audio: null };
//       }

//       // Fetch the word's audio file from GridFS
//       const fileId = new mongoose.Types.ObjectId(word.audioFileId);
//       const downloadStream = bucket.openDownloadStream(fileId);

//       return new Promise((resolve, reject) => {
//         let audioChunks = [];
        
//         downloadStream.on("data", (chunk) => {
//           audioChunks.push(chunk);
//         });

//         downloadStream.on("end", () => {
//           const audioBuffer = Buffer.concat(audioChunks);
//           const base64Audio = audioBuffer.toString("base64"); // Convert to Base64

//           resolve({ 
//             _id: word._id, 
//             word: word.word, 
//             audio: `data:audio/mpeg;base64,${base64Audio}`,
//             sentence: word.sentence || null
//           });
//         });

//         downloadStream.on("error", (err) => reject(err));
//       });
//     }));

//     // Fetch the sentence and sentence audio
//     let sentenceData = { sentence: alphabetEntry.sentence || "No sentence found", sentenceAudio: null };


//     if (alphabetEntry.sentenceAudioFileId) {
//       try {
//         const sentenceAudioId = new mongoose.Types.ObjectId(alphabetEntry.sentenceAudioFileId);
//         const sentenceAudioStream = bucket.openDownloadStream(sentenceAudioId);

//         sentenceData.sentenceAudio = await new Promise((resolve, reject) => {
//           let audioChunks = [];
          
//           sentenceAudioStream.on("data", (chunk) => {
//             audioChunks.push(chunk);
//           });

//           sentenceAudioStream.on("end", () => {
//             const audioBuffer = Buffer.concat(audioChunks);
//             const base64Audio = audioBuffer.toString("base64");
//             resolve(`data:audio/mpeg;base64,${base64Audio}`);
//           });

//           sentenceAudioStream.on("error", (err) => reject(err));
//         });

//       } catch (err) {
//         console.error("Error fetching sentence audio:", err);
//       }
//     }


//     // Return words along with sentence data
//     res.json({ words: wordsWithAudio, sentence: sentenceData.sentence, sentenceAudio: sentenceData.sentenceAudio });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Error fetching words, sentence, and audio" });
//   }
// };

const getWordsByAlphabet = async (req, res) => {
  try {
    const { alphabet } = req.params;
    const bucket = getBucket("audios");

    // Fetch the alphabet entry
    const alphabetEntry = await Alphabet.findById(alphabet);

    if (!alphabetEntry) {
      return res.status(404).json({ message: "Alphabet not found" });
    }

    // Process words and fetch audio & sentence audio files
    const wordsWithAudio = await Promise.all(
      alphabetEntry.words.map(async (word) => {
        let wordAudio = null;
        let sentenceAudio = null;

        // Fetch word audio if available
        if (word.audioFileId) {
          const fileId = new mongoose.Types.ObjectId(word.audioFileId);
          const downloadStream = bucket.openDownloadStream(fileId);
          wordAudio = await streamToBase64(downloadStream);
        }

        // Fetch sentence audio if available
        if (word.sentenceAudioFileId) {
          const sentenceAudioId = new mongoose.Types.ObjectId(word.sentenceAudioFileId);
          const sentenceAudioStream = bucket.openDownloadStream(sentenceAudioId);
          sentenceAudio = await streamToBase64(sentenceAudioStream);
        }

        return {
          _id: word._id,
          word: word.word,
          audio: wordAudio,
          sentence: word.sentence || null,
          sentenceAudio: sentenceAudio
        };
      })
    );

    // Return words with their individual sentence & audio
    res.json({ words: wordsWithAudio });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error fetching words and audio" });
  }
};

// Helper function to convert GridFS stream to Base64
const streamToBase64 = (downloadStream) => {
  return new Promise((resolve, reject) => {
    let audioChunks = [];

    downloadStream.on("data", (chunk) => audioChunks.push(chunk));
    downloadStream.on("end", () => {
      const audioBuffer = Buffer.concat(audioChunks);
      resolve(`data:audio/mpeg;base64,${audioBuffer.toString("base64")}`);
    });
    downloadStream.on("error", (err) => reject(err));
  });
};





// ✅ Get Audio for a Word
const getAudio = async (req, res) => {
  try {
    const { alphabet, word } = req.params;
    const bucket = getBucket("audios");

    // Find Word
    const alphabetEntry = await Alphabet.findById({ _id: alphabet });
    if (!alphabetEntry) return res.status(404).json({ message: "Alphabet not found" });

    const wordEntry = alphabetEntry.words.find(w => w._id.toString() === word);
    if (!wordEntry) return res.status(404).json({ message: "Word not found" });
    
    // Stream audio
    const fileId = new mongoose.Types.ObjectId(wordEntry.audioFileId);
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audio" });
  }
};


// ✅ Add a Sentence & Sentence Audio to a Word inside an Alphabet
const addWordSentence = async (req, res) => {
  try {
    const { alphabet, wordId } = req.params;
    const { sentence } = req.body;
    
    const alphabetEntry = await Alphabet.findById(alphabet);
    if (!alphabetEntry) return res.status(404).json({ message: "Alphabet not found" });

    // Find the word inside the alphabet
    const wordEntry = alphabetEntry.words.id(wordId);
    if (!wordEntry) return res.status(404).json({ message: "Word not found" });
    
    // Add sentence field if it doesn't exist in the document
    if (!wordEntry.sentence) {
        wordEntry.sentence = sentence;
    } else {
        wordEntry.sentence += " " + sentence; // Append if already exists
    }
    
    // Save the changes
    await alphabetEntry.save();

    res.status(200).json({ message: "Sentence added to word", word: wordEntry });
  } catch (error) {
    console.error("Error adding sentence:", error);
    res.status(500).json({ message: "Error adding sentence" });
  }
};

// ✅ Upload Sentence Audio for a Word
const uploadWordSentenceAudio = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const { alphabet, wordId } = req.params;
    
    const bucket = getBucket("audios");
    
    // Find Alphabet
    const alphabetEntry = await Alphabet.findById(alphabet);
    if (!alphabetEntry) return res.status(404).json({ message: "Alphabet not found" });

    // Find the word inside the alphabet
    const wordEntry = alphabetEntry.words.id(wordId);
    if (!wordEntry) return res.status(404).json({ message: "Word not found" });

    // Upload Audio to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.write(req.file.buffer);
    uploadStream.end();

    uploadStream.on("finish", async () => {
      wordEntry.sentenceAudioFileId = uploadStream.id;
      await alphabetEntry.save();
      res.status(201).json({ message: "Sentence audio uploaded", fileId: uploadStream.id });
    });

  } catch (error) {
    console.error("Error uploading sentence audio:", error);
    res.status(500).json({ message: "Error uploading sentence audio" });
  }
};


export { createAlphabet, addWord, uploadAudio, getAlphabets, getWordsByAlphabet, getAudio, addWordSentence, uploadWordSentenceAudio };
