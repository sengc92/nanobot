import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let context = [{role: "user", content:`请记住规则：如果任務需要執行命令，请严格只返回格式：
                                        不要多余文字，不要解释，只返回格式。`}];

async function chatAPI(prompt) {
        if (prompt.toLowerCase() === "exit") {
            console.log("\n👋 Bye!");
            rl.close(); // 关闭 readline
            process.exit(0); // 彻底退出 Node
        }
        try {
            const res = await axios.post(
                "https://api.siliconflow.cn/v1/chat/completions",
                {
                    model: "Pro/MiniMaxAI/MiniMax-M2.5",
                    messages: [
                        { role: "user", content: "历史对话："+context.join("\n") + "User: "+prompt}
                    ]
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer sk-muthqqiuulqhgrrsqhxrperaeddqtxvprgldrvrnxbslptvd"
                    }
                }
            );
            const answer = res.data.choices[0].message.content;
            console.log("\n✅ Answer:", answer);
            context.push("User: " + prompt);
            context.push("AI: " + answer);
            console.log("\nContext:", context);
        } catch (err) {
            console.error("❌ Error:", err);
        }
}

function startChat(){
    rl.question("User:", async (userInput)=>{
        await chatAPI(userInput);
        startChat();
    })
}

startChat();

