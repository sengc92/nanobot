import axios from 'axios';
import readline from 'readline';
import { execSync } from 'child_process'; // 执行命令

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let context = [];

// 检测是否是命令行（简单规则：不含中文，长度短，是系统命令）
function isCommand(text) {
    const cmdPattern = /^[a-zA-Z0-9\s_\\.\-:/<>|]*$/;
    return cmdPattern.test(text.trim()) && text.length < 200;
}

async function chatAPI(prompt) {
    if (prompt.toLowerCase() === "exit") {
        console.log("👋 Bye!");
        rl.close();
        process.exit(0);
    }

    try {
        const res = await axios.post(
            "https://api.siliconflow.cn/v1/chat/completions",
            {
                model: "deepseek-ai/DeepSeek-V3.2",
                messages: [
                    {
                        role: "user",
                        content: `
【规则】
1. 如果用户需要执行命令行操作，只返回纯命令，不要任何文字。
   例：echo hello > hello.txt
   例：mkdir test
   例：dir
2. 如果是普通问答，正常回答。

历史对话：
${context.join("\n")}

User: ${prompt}
                        `.trim()
                    }
                ],
                temperature: 0.1, // 让输出更稳定、更遵守规则
                max_tokens: 500 // 控制输出长度
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer sk-muthqqiuulqhgrrsqhxrperaeddqtxvprgldrvrnxbslptvd"
                }
            }
        );

        let answer = res.data.choices[0].message.content.trim();
        console.log("\n🤖 AI:", answer);

        // ==========================================
        // 自动判断：如果是命令 → 直接执行
        // ==========================================
        if (isCommand(answer)) {
            try {
                console.log("🚀 执行命令：", answer);
                const result = execSync(answer, { encoding: 'utf8' });
                console.log("✅ 执行结果：\n", result);
                answer = `✅ 已执行：${answer}\n结果：${result}`;
            } catch (e) {
                console.log("❌ 执行失败");
                answer = "❌ 命令执行失败";
            }
        }

        context.push(`User: ${prompt}`);
        context.push(`AI: ${answer}`);

    } catch (err) {
        console.error("❌ Error:", err.response?.data || err.message);
    }
}

function startChat() {
    rl.question("User: ", async (input) => {
        await chatAPI(input);
        startChat();
    });
}

startChat();