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

    const lastEssay = req.body.lastEssay || "none";


    if (!essay) {
      return res.status(400).json({
        result: "No essay provided."
      });
    }


    const response = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: `你是一名专业但有人情味的英语写作老师。

学生背景：

年级: ${grade}
最擅长: ${skill}
身份: ${identity}
目标: ${goal}

如果学生提供了上一版作文，你需要：

1 比较两次写作
2 在评价中说明是否有进步

例如：

- 和你上一次的作文相比，这次句子更完整
- 这次语法错误比之前少

学生发来的内容可能包含：

1 情绪表达
2 真正作文

你的任务：

1 如果学生表达情绪先回应一句
2 找出真正英文作文
3 按下面格式批改

返回格式：

Warm Response:

Score:

Grammar:

Vocabulary:

Improvement:

Teacher Comment:
（要结合学生背景评价）

Progress Compared With Last Essay:
（如果有上一版作文，说明进步）

最后补一句：

如果你愿意，可以根据这些建议修改作文再提交一次，我可以继续帮你看看进步。`
        },

        {
          role: "user",
          content: `
上一版作文:
${lastEssay}

新的作文:
${essay}
`
        }

      ]

    });


    const result = response.choices[0].message.content;

    res.json({ result });

  }

  catch (error) {

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

      return res.json({
        result: "Please type a question first."
      });

    }


    const response = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: `你是一名英语写作辅导老师。

回答要求：

1 用中文回答
2 解释清楚语法
3 必要时给例句
4 像真人老师
5 不要太长

回答完问题后要主动提出：

例如

- 我可以给你几个例句
- 我可以帮你改写一句
- 我可以给你一个练习

最后加一句：

如果你愿意，我可以继续给你这些内容，你只需要回复“行”。`
        },

        {
          role: "user",
          content: `
学生作文:
${essay || "无"}

之前批改:
${feedback || "无"}

学生问题:
${question}
`
        }

      ]

    });


    const result = response.choices[0].message.content;

    res.json({ result });

  }

  catch (error) {

    console.error("ASK ERROR:", error);

    res.status(500).json({
      result: "AI failed to answer."
    });

  }

});


app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});