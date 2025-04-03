import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  audioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audios" }, // Word's audio file
  sentence: { type: String}, // Sentence for the word
  sentenceAudioFileId: { type: mongoose.Schema.Types.ObjectId, ref: "audios" }, // Sentence audio file
});

const alphabetSchema = new mongoose.Schema({
  letter: { type: String, required: true, unique: true }, // A-Z
  words: [wordSchema], // Array of words (each word has its own sentence + audio)
});

const Alphabet = mongoose.model("Alphabet", alphabetSchema);
export default Alphabet;
