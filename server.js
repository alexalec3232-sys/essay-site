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
          content: `你是一名专业的英语写作老师。请用中文批改这篇英文作文，并严格按照下面格式返回：

Score:
（给出10分制分数）

Grammar:
（列出2-4个最明显的语法问题）

Vocabulary:
（列出2-4个词汇提升建议）

Improvement:
（给出2-3句更好的改写建议）

Teacher Comment:
（用自然、具体、不那么像AI套话的方式总结评价）

最后补充一句：
如果你愿意，可以根据这些建议修改作文再提交一次，我可以帮你看看你提升了哪里。

不要输出多余开场白，必须严格按上面的标题格式返回。`
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