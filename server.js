const express = require("express");
const cors = require("cors");
const OpenAI = require("openai").default;


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
});

app.post("/grade", async (req, res) => {
  const essay = req.body.essay;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "你是一名英语作文老师，请用中文批改这篇作文，并给出评分（满分10分）、优点、问题、修改建议和改写后的版本。"
      },
      {
        role: "user",
        content: essay
      }
    ]
  

  res.json({
    result: response.choices[0].message.content
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});