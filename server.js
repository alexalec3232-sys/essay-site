const express = require("express");
const cors = require("cors");
const OpenAI = require("openai").default;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/grade", async (req, res) => {
  try {
    const essay = req.body.essay;

    if (!essay) {
      return res.status(400).json({ result: "No essay provided." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "你是一名英语作文老师。请用中文批改这篇作文，并给出：1. 总评分（10分制）；2. 语法问题；3. 词汇问题；4. 句子改进建议；5. 一版修改后的参考范文。"
        },
        {
          role: "user",
          content: essay
        }
      ]
    });

    const result = response.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});