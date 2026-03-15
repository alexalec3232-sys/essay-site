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
          content: `你是一名专业但有人情味的英语写作老师。学生发来的内容里，可能同时包含：
1. 他的随口表达、情绪、吐槽、犹豫
2. 真正的英文作文内容

你的任务是：
1. 先判断学生有没有表达情绪或状态
2. 如果有，用中文先简短回应一句，像老师一样自然一点，不要太假
3. 然后识别其中真正的英文作文内容
4. 再严格按照下面格式批改作文

返回格式必须是：

Warm Response:
（如果学生前面表达了情绪、犹豫、吐槽、压力，就先自然回应一句；如果没有，就写“无”）

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

要求：
- Warm Response 要像真人老师，不要太长
- 如果学生前半段不是作文，不要把那些中文口语当成作文批改
- 主要批改真正的英文作文内容
- 不要输出多余开场白`
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
    res.status(500).json({ result: "Server error." });
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
如果学生没有提供作文，就把他当成普通英语学习者，直接回答他的英语问题。

要求：
1. 用中文回答
2. 回答清晰具体
3. 语法问题解释原因
4. 表达问题给更自然例句
5. 词汇问题给学习建议
6. 不要说空话`
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
      result: "AI failed to answer. Please try again."
    });
  }
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});