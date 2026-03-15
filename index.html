<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Essay Helper</title>

  <style>
    body{
      font-family: Arial, sans-serif;
      margin:0;
      background:#f5f5f5;
      color:#111;
      text-align:center;
    }

    .page{
      display:none;
      padding:40px 20px;
      max-width:700px;
      margin:auto;
    }

    .active{
      display:block;
    }

    h1{
      font-size:40px;
      margin-bottom:20px;
    }

    h2{
      font-size:28px;
      margin-bottom:16px;
    }

    p{
      color:#666;
      font-size:18px;
      line-height:1.6;
    }

    button{
      background:black;
      color:white;
      border:none;
      padding:14px 30px;
      border-radius:30px;
      font-size:18px;
      cursor:pointer;
      margin-top:20px;
    }

    .learn{
      margin-top:20px;
      color:#666;
      cursor:pointer;
    }

    textarea,input,select{
      width:100%;
      padding:14px;
      border-radius:10px;
      border:1px solid #ddd;
      margin-top:10px;
      font-size:16px;
      box-sizing:border-box;
    }

    .card{
      background:white;
      padding:20px;
      border-radius:20px;
      margin-top:20px;
      box-shadow:0 5px 20px rgba(0,0,0,0.05);
    }

    .result-box{
      background:#fafafa;
      border:1px solid #eee;
      border-radius:12px;
      padding:16px;
      margin-top:10px;
      text-align:left;
      white-space:pre-wrap;
      line-height:1.7;
      min-height:100px;
      color:#333;
    }
  </style>
</head>

<body>

  <!-- 首页 -->
  <div id="home" class="page active">
    <h1>如果你点开了，那就努力完成你心中的梦</h1>
    <p>If you opened this, then work hard to complete the dream in your heart.</p >
    <button onclick="goEssay()">Start Free</button>
    <div class="learn" onclick="goInfo()">Learn More</div>
  </div>

  <!-- 信息填写页 -->
  <div id="info" class="page">
    <h1>Tell AI About You</h1>

    <div class="card">
      <p>Grade / 年级</p >
      <input id="grade" placeholder="e.g. Grade 10 / 高二">

      <p>Best Skill / 最擅长</p >
      <select id="skill">
        <option>Not sure</option>
        <option>Writing</option>
        <option>Reading</option>
        <option>Speaking</option>
        <option>Listening</option>
      </select>

      <p>Identity / 身份</p >
      <select id="identity">
        <option>Student</option>
        <option>International Student</option>
        <option>Exchange Student</option>
      </select>

      <p>Goal / 使用目的</p >
      <select id="goal">
        <option>Improve English</option>
        <option>IELTS</option>
        <option>School Exam</option>
        <option>Daily Communication</option>
      </select>

      <button onclick="goEssay()">Continue</button>
    </div>
  </div>

  <!-- 作文页 -->
  <div id="essayPage" class="page">
    <h1>AI Essay Helper</h1>
    <p>Write your essay and get instant feedback.</p >

    <!-- 1. 填写作文 -->
    <div class="card">
      <h2>Your Essay</h2>
      <textarea id="essay" rows="8" placeholder="Write your essay here..."></textarea>
      <button onclick="gradeEssay()">Grade Essay</button>
    </div>

    <!-- 2. 回复作文 -->
    <div class="card">
      <h2>Essay Feedback</h2>
      <div id="suggestion" class="result-box">Waiting for your essay...</div>
    </div>

    <!-- 3. 提问 -->
    <div class="card">
      <h2>Ask AI</h2>
      <textarea id="question" rows="3" placeholder="Ask about grammar, vocabulary, sentence meaning, or learning methods..."></textarea>
      <button onclick="askAI()">Send Question</button>
    </div>

    <!-- 4. 回复问题 -->
    <div class="card">
      <h2>AI Response</h2>
      <div id="chatResponse" class="result-box">Waiting for your question...</div>
    </div>
  </div>

  <script>
    function showPage(id){
      document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
      document.getElementById(id).classList.add("active");
    }

    function goInfo(){
      showPage("info");
    }

    function goEssay(){
      showPage("essayPage");
    }

    async function gradeEssay(){
      const essay = document.getElementById("essay").value.trim();
      const grade = document.getElementById("grade")?.value || "";
      const skill = document.getElementById("skill")?.value || "";
      const identity = document.getElementById("identity")?.value || "";
      const goal = document.getElementById("goal")?.value || "";
      const lastEssay = localStorage.getItem("lastEssay") || "";

      if(!essay){
        document.getElementById("suggestion").innerText = "请先输入作文内容。";
        return;
      }

      document.getElementById("suggestion").innerText = "AI is thinking...";

      try{
        const res = await fetch("/grade", {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            essay,
            grade,
            skill,
            identity,
            goal,
            lastEssay
          })
        });

        const data = await res.json();
        document.getElementById("suggestion").innerText = data.result || "批改失败。";
        localStorage.setItem("lastEssay", essay);

      }catch(error){
        document.getElementById("suggestion").innerText = "批改失败，请稍后再试。";
      }
    }

    async function askAI(){
      const question = document.getElementById("question").value.trim();
      const essay = document.getElementById("essay").value.trim();
      const feedback = document.getElementById("suggestion").innerText;

      const lastAskQuestion = localStorage.getItem("lastAskQuestion") || "";
      const lastAskAnswer = localStorage.getItem("lastAskAnswer") || "";

      if(!question){
        document.getElementById("chatResponse").innerText = "请先输入你的问题。";
        return;
      }

      document.getElementById("chatResponse").innerText = "AI is thinking...";

      try{
        const res = await fetch("/ask", {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            question,
            essay,
            feedback,
            lastAskQuestion,
            lastAskAnswer
          })
        });

        const data = await res.json();
        const result = data.result || "回答失败。";

        document.getElementById("chatResponse").innerText = result;

        localStorage.setItem("lastAskQuestion", question);
        localStorage.setItem("lastAskAnswer", result);

      }catch(error){
        document.getElementById("chatResponse").innerText = "回答失败，请稍后再试。";
      }
    }
  </script>

</body>
</html>