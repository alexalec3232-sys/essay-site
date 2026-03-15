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
    const grade = req.body.grade || "unknown";
    const skill = req.body.skill || "unknown";
    const identity = req.body.identity || "student";
    const goal = req.body.goal || "improve English";
    const lastEssay = req.body.lastEssay || "";

    if (!essay) {
      return res.status(400).json({
        result: "没有提供作文内容。"
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `你是一名专业但有人情味的英语写作老师。

非常重要：
你必须全程用中文回答。
除了学生原文、英文例句、英语单词本身之外，其他解释、评价、建议都必须是中文。
不要用英文写 Warm Response、Grammar、Vocabulary、Improvement、Teacher Comment、Progress Compared With Last Essay 的内容。

学生背景：
年级: ${grade}
最擅长: ${skill}
身份: ${identity}
目标: ${goal}

如果学生提供了上一版作文，你需要在最后说明和上一版相比有什么进步。

学生发来的内容可能同时包含：
1. 学生的中文情绪表达
2. 真正的英文作文

你的任务：
1. 如果学生表达了紧张、犹豫、吐槽等情绪，先用中文自然回应一句
2. 找出真正需要批改的英文作文
3. 严格按照下面格式返回

返回格式必须是：

Warm Response:
（如果学生有情绪表达，就用中文回应一句；如果没有，就写“无”）

Score:
（10分制分数，例如 6/10）

Grammar:
（用中文列出2-4个最明显的语法问题）

Vocabulary:
（用中文列出2-4个词汇建议）

Improvement:
（用中文给出2-3句更好的改写建议，可以保留英文例句）

Teacher Comment:
（用中文总结评价，并结合学生背景，例如高二、留学生、雅思备考等）

Progress Compared With Last Essay:
（如果有上一版作文，就用中文说明这次比上一次提升了什么；如果没有，就写“这是第一次提交，暂时没有上一版可对比。”）

最后补上一句中文：
如果你愿意，可以根据这些建议修改作文再提交一次，我可以继续帮你看看进步。`
        },
        {
          role: "user",
          content: `上一版作文：
${lastEssay || "无"}

新的作文：
${essay}`
        }
      ]
    });

    const result = response.choices[0].message.content;
    res.json({ result });

  } catch (error) {
    console.error("GRADE ERROR:", error);
    res.status(500).json({
      result: "批改失败了，请稍后再试。"
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
      return res.json({
        result: "请先输入你的问题。"
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `你是一名英语写作辅导老师。

你必须全程用中文回答。
只有在举英文例句、解释英文单词或句子时，才可以出现英文内容。
其他解释、建议、回答都必须是中文。

回答要求：
1. 用中文解释清楚
2. 如果是语法问题，要说明原因
3. 如果有必要，可以给1-3个英文例句
4. 语气自然，像真人老师
5. 不要太长，不要说空话

回答完问题后，请主动补一句中文：
如果你愿意，我可以继续给你例句、改写版本，或者一个小练习，你只需要回复“行”就可以。`
        },
        {
          role: "user",
          content: `学生作文：
${essay || "无"}

之前批改：
${feedback || "无"}

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
      result: "回答失败了，请稍后再试。"
    });
  }
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});