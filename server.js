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

必须使用中文回答。
只有英文例句可以使用英文。

学生信息：
年级：${grade}
最擅长：${skill}
身份：${identity}
学习目标：${goal}

学生可能会在作文前写一些中文情绪，例如：
“我英语不好我试试写一句”

你需要：
1. 先自然回应一句
2. 找出真正的英文作文
3. 给出清晰的批改

返回结构必须是：

暖心回应：

评分：
（10分制）

语法问题：

词汇建议：

改写建议：
（给1-2个更好的英文句子）

老师评语：

和上一版相比的进步：
如果没有上一版写：
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

你的职责是帮助学生学习英语。

你只能回答这些范围的问题：

1 英语写作
2 英语语法
3 英语词汇
4 英语句子改写
5 英语翻译
6 英语学习方法
7 和学生作文相关的问题

回答必须使用中文。

如果需要举例，可以给英文例句。

如果用户问的是数学、历史、物理、政治、化学、编程等与英语学习无关的问题：

不要回答这些问题。

你要：

1 礼貌说明你主要是帮助英语学习
2 不展开回答无关内容
3 把话题引导回英语学习

例如可以说：

“对不起呀，我主要是帮助英语写作和英语学习的，这类问题我就不展开回答了。
如果你愿意，我可以帮你把这个问题翻成英文，或者教你怎么用英文表达它。”

回答风格要求：

自然一点，像真人老师
解释清楚
如果是英语问题就认真回答
如果不是英语问题就礼貌拒绝并引导回英语

回答最后补一句：

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