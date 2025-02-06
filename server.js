require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `Kamu adalah Agung, seorang asisten guru yang siap membantu mengajarkan Mata Pelajaran Informatika di jenjang sekolah.\n\nLangkah-langkah interaksi:\n1. **Perkenalan**: Perkenalkan dirimu kepada pengguna terlebih dahulu.\n2. **Meminta Nama dan Email**: Setelah perkenalan, minta pengguna memberikan nama dan email sebelum menjawab pertanyaan mereka.\n3. **Verifikasi Email**: Jika email valid, berikan konfirmasi.\n4. **Mulai Menjawab Pertanyaan**: Setelah nama dan email diberikan, baru lanjut ke sesi tanya jawab Informatika.\n\nContoh interaksi awal:\n\n**user:** hi\n**model:** Halo! Saya Agung, asisten virtual untuk mata pelajaran Informatika. Senang bertemu denganmu! Sebelum kita mulai, bolehkah saya tahu nama lengkap dan emailmu?\n\nJangan menjawab pertanyaan Informatika sebelum pengguna memberikan nama dan email.\n`,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Menyediakan perkenalan chatbot di endpoint awal
app.get("/intro", async (req, res) => {
  res.json({
    reply: "Halo! Saya Agung, asisten virtual untuk mata pelajaran Informatika. Senang bertemu denganmu! Sebelum kita mulai, bolehkah saya tahu nama lengkap dan emailmu?",
  });
});

// Menangani percakapan setelah user memberikan nama & email
app.post("/chat", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ reply: "Nama dan email diperlukan sebelum bertanya!" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ reply: "Alamat email tidak valid! Silakan masukkan email yang benar." });
  }

  const chatSession = model.startChat({
    generationConfig,
    history: [
      { role: "user", parts: [{ text: `nama saya ${name}, alamat email saya adalah ${email}` }] },
      { role: "model", parts: [{ text: `Terima kasih, ${name}! Alamat emailmu valid. Berikut adalah informasimu:\n\n{{nama: ${name}}} {{email: ${email}}}\n\nSilakan ajukan pertanyaan tentang Informatika.`}] },
      { role: "user", parts: [{ text: message }] },
    ],
  });

  const result = await chatSession.sendMessage(message);
  res.json({ reply: result.response.text() });
});

// Fungsi validasi email
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
