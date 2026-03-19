import axios from 'axios';
import readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let messages = [];

// CHECK IF AI OUTPUT IS A SHELL COMMAND
function isCommand(text) {
    return text.trim().includes("[COMMAND]");
}

function extractCommand(text) {
  return text.replace("[COMMAND]", "").trim();
}

// EXECUTE SYSTEM COMMAND
function runCommand(cmd) {
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    return `🦞 Agent: command executed`;
  } catch (err) {
    return `🦞 Agent: ${err.message}`;
  }
}

// STREAMLINED AI AGENT BRAIN (AUTO-LOOP)
async function agentLoop(userInput) {
  messages.push({ role: "user", content: userInput });

  while (true) {
    // AI THINK
    const res = await axios.post(
      "https://api.siliconflow.cn/v1/chat/completions",
      {
        model: "deepseek-ai/DeepSeek-V3.2",
        messages: [
          {
            role: "system",
            content: `You are an autonomous AI agent.
Rules:
1. If you need to perform an action → return ONLY [COMMAND] followed by the command.
2. If you can answer directly → reply normally.
3. When the task is fully done → return: [DONE] summary.
Keep outputs short and clean.`
          },
          ...messages
        ],
        temperature: 0.1,
        max_tokens: 600
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-muthqqiuulqhgrrsqhxrperaeddqtxvprgldrvrnxbslptvd"
        }
      }
    );

    const aiReply = res.data.choices[0].message.content.trim();
    console.log("\n🤖 AI:", aiReply);
    messages.push({ role: "assistant", content: aiReply });

    // TASK FINISHED
    if (aiReply.startsWith("[DONE]")) {
        console.log("✅ Task complete.\n");
        break;
    }

    // IF IT'S A COMMAND → EXECUTE AND SEND RESULT BACK TO AI
    if (aiReply.startsWith("[COMMAND]")) {
      const cmd = aiReply.replace("[COMMAND]", "").trim();
      const execResult = runCommand(cmd);
      console.log(execResult);
      messages.push({ role: "user", content: execResult });
    }
    // IF IT'S JUST TEXT → STOP LOOP
    else {
      break;
    }
  }
}

// START CHAT LOOP
function start() {
  rl.question("User: ", async (input) => {
    await agentLoop(input);
    start();
  });
}

start();