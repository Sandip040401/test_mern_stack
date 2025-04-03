import express from "express";
import { upload } from "../middleware/upload.js";
import { 
  createAlphabet, 
  addWord, 
  uploadAudio, 
  getAlphabets, 
  getWordsByAlphabet, 
  getAudio, 
  addWordSentence,
  uploadWordSentenceAudio
} from "../controllers/alphabetController.js";

const router = express.Router();
// to create a alphabet
router.post("/alphabets", createAlphabet);
// to add a word
router.post("/alphabets/:alphabet/words", addWord);
// to add a audio
router.post("/alphabets/:alphabet/words/:word/audio", upload.single("file"), uploadAudio);
// to get all alphabets
router.get("/alphabets", getAlphabets);
// to get words by id
router.get("/alphabets/:alphabet/words", getWordsByAlphabet);
// to get audio by id
router.get("/alphabets/:alphabet/words/:word/audio", getAudio);

// ✅ Add a Sentence to an Alphabet
router.post("/alphabets/:alphabet/sentence/:wordId", addWordSentence);

// ✅ Upload Audio for a Sentence
router.post("/alphabets/:alphabet/sentence/audio", upload.single("file"), uploadWordSentenceAudio);


export default router;
