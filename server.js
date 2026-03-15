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
    const grade = req.body.grade || "未填写";
    const skill = req.body.skill || "未填写";
    const identity = req.body.identity || "未填写";
    const goal = req.body.goal || "未填写";

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
只有英文例句和学生原文可以使用英文，其他解释必须全部是中文。

学生本次填写的信息：
年级：${grade}
最擅长：${skill}
身份：${identity}
学习目标：${goal}

非常重要：
这些信息不是摆设。你要在“老师评语”里自然体现出你认真看过这些信息。
但不要生硬，不要乱夸，不要每一项都硬提。
你应该像真人老师一样，有根据地提一句最 relevant 的。

例如：
- 如果学生最擅长 Speaking，可以说：你可能把口语表达的直接感带进写作了，这说明你口语思路比较自然，但写作里还需要更正式一点。
- 如果学生最擅长 Reading，可以说：你有一定阅读输入的痕迹，说明你接触过比较完整的句子结构。
- 如果学生身份是 International Student，可以说：作为国际生，这样的表达已经说明你有一定英语沟通基础。
- 如果目标是 IELTS，可以说：如果按雅思写作的要求来看，这里还需要更清楚的展开和更稳定的语法。
- 如果年级较低，可以用鼓励语气；如果年级较高，可以稍微严格一点。

你的任务：
1. 识别学生的英文作文
2. 用中文进行批改
3. 让学生感觉问卷真的被认真看过
4. 语气自然，不要太像机器，不要模板味太重

返回结构必须是：

暖心回应：

评分：
（10分制，例如 6/10）

语法问题：

词汇建议：

改写建议：
（给出1-2句更好的英文句子）

老师评语：
（这里必须自然结合本次填写的信息，但只能挑最 relevant 的1-2点来讲）

最后补一句：
如果你愿意，可以根据这些建议修改作文再提交一次，我可以继续帮你看看进步。
`
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

如果用户的问题可以被合理理解为英语词汇、英语表达、英语句子、英语例句、英语翻译、英语学习方法中的一种，
你应该优先把它当作英语学习问题来回答，而不是拒绝。

如果问题明显和英语学习无关，你再礼貌拒绝，并引导回英语学习。

回答风格要求：
1. 自然一点，像真人老师
2. 解释清楚
3. 不要太空，不要太敷衍
4. 回答最后补一句：
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