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


/* ------------------------
   ESSAY GRADING
------------------------ */

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
          content: `你是一名专业但有人情味的英语写作老师。

学生发来的内容里，可能同时包含：
1. 他的情绪或随口表达
2. 真正的英文作文

你的任务：

1. 如果学生有表达情绪，先简单回应一句（像真人老师）
2. 找出真正的英文作文
3. 按下面格式批改

返回格式必须是：

Warm Response:
（如果学生表达了情绪就回应一句，否则写“无”）

Score:
（10分制）

Grammar:
（2-4个语法问题）

Vocabulary:
（2-4个词汇建议）

Improvement:
（2-3句更好的改写）

Teacher Comment:
（自然总结）

最后补一句：
如果你愿意，可以根据这些建议修改作文再提交一次，我可以帮你看看你提升了哪里。

要求：
不要输出多余开场白。`
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

    console.error("GRADE ERROR:", error);

    res.status(500).json({
      result: "Server error."
    });

  }
});


/* ------------------------
   ASK AI
------------------------ */

app.post("/ask", async (req, res) => {
  try {

    const { essay, feedback, question } = req.body;

    if (!question) {
      return res.json({ result: "Please type a question first." });
    }

    const response = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: `你是一名英语写作辅导老师。

如果学生提供了作文和批改结果，就结合这些内容回答。
如果没有作文，就把学生当普通英语学习者。

回答要求：

1 用中文回答
2 解释清楚语法或表达
3 必要时给例句
4 不要太长
5 像真人老师说话

最重要的一点：

回答完学生问题后，你要主动给一个继续学习的建议，例如：

- 我可以给你几个例句
- 我可以帮你改写一句
- 我可以给你一个简单练习
- 我可以给你一个记忆方法

最后加一句：

"如果你愿意，我可以继续给你这些内容，你只需要回复“行”就可以。"`
        },

        {
          role: "user",
          content: `学生作文：
${essay || "（没有提供作文）"}

之前批改：
${feedback || "（没有提供批改）"}

学生问题：
${question}`
        }
      ]
    });

    const result = response.choices[0].message.content;

    res.json({ result });

  } catch (error) {

    console.error("ASK ERROR:", error);

    res.status(500).json({
      result: "AI failed to answer."
    });

  }
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});