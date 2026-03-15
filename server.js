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
  apiKey: process.env.OPENAI_API_KEY
});


/* -------------------------
   ESSAY GRADING
------------------------- */

app.post("/grade", async (req, res) => {
  try {

    const essay = req.body.essay || "";
    const grade = req.body.grade || "未知";
    const skill = req.body.skill || "未知";
    const identity = req.body.identity || "学生";
    const goal = req.body.goal || "提升英语";
    const lastEssay = req.body.lastEssay || "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [

        {
          role: "system",
          content: `
你是一名专业但有人情味的英语写作老师。

非常重要：
你必须使用中文回答。
除了学生原文和英文例句，其他解释必须是中文。

学生信息：
年级：${grade}
最擅长：${skill}
身份：${identity}
学习目标：${goal}

学生可能会在作文前写一些中文情绪，例如：
“我英语不好我试试写一句”
你需要先自然回应一句。

然后分析英文作文。

返回必须使用以下结构：

暖心回应：
（用中文简单鼓励）

评分：
（10分制，例如 6/10）

语法问题：
（用中文解释语法）

词汇建议：
（用中文说明词汇水平）

改写建议：
（给出1-2句更好的英文句子）

老师评语：
（用中文总结评价）

和上一版相比的进步：
如果没有上一版就写：
这是第一次提交，暂时没有上一版可对比。

最后补一句：
如果你愿意，可以根据这些建议修改作文再提交一次，我可以继续帮你看看进步。
`
        },

        {
          role: "user",
          content: `
上一版作文：
${lastEssay || "无"}

新的作文：
${essay}
`
        }

      ]
    });

    const result = response.choices[0].message.content;

    res.json({
      result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      result: "AI批改失败，请稍后再试。"
    });

  }
});


/* -------------------------
   ASK AI
------------------------- */

app.post("/ask", async (req, res) => {
  try {

    const essay = req.body.essay || "";
    const feedback = req.body.feedback || "";
    const question = req.body.question || "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [

        {
          role: "system",
          content: `
你是一名英语写作老师。

你必须用中文回答。

如果涉及语法问题：
1. 用中文解释
2. 可以给英文例句

语气自然，像真人老师。

回答完问题后补一句：
如果你愿意，我可以继续给你例句、改写版本或者一个小练习，你只需要回复“行”。
`
        },

        {
          role: "user",
          content: `
学生作文：
${essay}

AI之前的批改：
${feedback}

学生问题：
${question}
`
        }

      ]
    });

    const result = response.choices[0].message.content;

    res.json({
      result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      result: "AI回答失败，请稍后再试。"
    });

  }
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});