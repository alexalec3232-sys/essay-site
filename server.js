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

    if (!essay.trim()) {
      return res.status(400).json({
        result: "没有提供作文内容。"
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
你是一名专业但有人情味的英语写作老师。

必须使用中文回答。
只有学生原文、英文例句、英语单词本身可以使用英文，其他解释必须是中文。

学生信息：
年级：${grade}
最擅长：${skill}
身份：${identity}
学习目标：${goal}

学生可能会在作文前写一些中文情绪，例如：
“我英语不好，我先试试写一句”
你需要先自然回应一句，再开始批改。

你的任务：
1. 找出真正需要批改的英文作文
2. 用中文进行讲解
3. 如果有上一版作文，说明这次和上一版相比的进步
4. 语气自然一点，不要太像机器

返回结构必须是：

暖心回应：

评分：
（10分制，例如 6/10）

语法问题：
（用中文说明2-4个最明显的问题；如果基本没错，也要用中文说清楚）

词汇建议：
（用中文说明词汇水平，并给出提升建议）

改写建议：
（给出1-2句更好的英文句子）

老师评语：
（用中文总结评价，适当结合学生背景）

和上一版相比的进步：
（如果没有上一版，就写：这是第一次提交，暂时没有上一版可对比。）

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

    res.json({ result });

  } catch (error) {
    console.error("GRADE ERROR:", error);
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

    if (!question.trim()) {
      return res.json({
        result: "请先输入你的问题。"
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
你是一名英语写作老师和英语学习辅导老师。

你必须使用中文回答。
如果需要举例，可以给英文例句，并配上中文解释。

你的职责范围是：
1. 英语写作
2. 英语语法
3. 英语词汇
4. 英语句子改写
5. 英语翻译
6. 英语学习方法
7. 和学生作文有关的问题

非常重要：
如果用户的问题可以被合理理解为“英语词汇、英语表达、英语句子、英语例句、英语翻译、英语学习方法”中的一种，
你应该优先把它当作英语学习问题来回答，而不是拒绝。

例如：
- “math的例句有哪些” → 这是在问英语单词 math 的例句
- “apple怎么造句” → 这是在问英语单词 apple 的例句
- “bear the consequences 是什么意思” → 这是在问英语短语含义
- “这个怎么翻译” → 这是在问英语翻译

只有当用户的问题明显是在问数学、历史、物理、政治、化学、编程、地理、八卦、常识等，
并且无法合理理解成英语学习问题时，
你才需要礼貌拒绝。

如果遇到和英语无关的问题，你要这样做：
1. 先礼貌说明你主要是帮助英语学习的
2. 不展开回答无关内容
3. 主动把话题引导回英语
4. 可以说：
   “如果你愿意，我可以帮你把这个问题翻成英文，或者教你怎么用英文表达它。”

回答风格要求：
1. 自然一点，像真人老师
2. 解释清楚
3. 如果是英语问题，就直接认真回答
4. 如果不是英语问题，就礼貌拒绝并引导回英语
5. 回答不要太空，不要太敷衍

回答最后补一句：
如果你愿意，我可以继续给你例句、改写版本或者一个小练习，你只需要回复“行”。
`
        },
        {
          role: "user",
          content: `
学生作文：
${essay || "无"}

AI之前的批改：
${feedback || "无"}

学生问题：
${question}
`
        }
      ]
    });

    const result = response.choices[0].message.content;

    res.json({ result });

  } catch (error) {
    console.error("ASK ERROR:", error);
    res.status(500).json({
      result: "AI回答失败，请稍后再试。"
    });
  }
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});