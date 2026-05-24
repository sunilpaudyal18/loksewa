const fs = require('fs');
const readline = require('readline');

const transcriptPath = "C:\\Users\\acer\\.gemini\\antigravity\\brain\\80dea17a-dd8f-4e43-94d3-eb7d0fc2126a\\.system_generated\\logs\\transcript.jsonl";

const fileStream = fs.createReadStream(transcriptPath);
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    try {
        const data = JSON.parse(line);
        const step = data.step_index ?? 0;
        const source = data.source ?? "";
        const type = data.type ?? "";
        const content = data.content ?? "";
        
        if (step >= 180 && step <= 200) {
            console.log(`=== STEP ${step} | ${source} | ${type} ===`);
            if (content) {
                let contentStr = content.trim();
                if (contentStr.length > 800) {
                    contentStr = contentStr.substring(0, 800) + "... (truncated)";
                }
                console.log(contentStr);
            }
            if (data.tool_calls && data.tool_calls.length > 0) {
                for (const tc of data.tool_calls) {
                    console.log(`  Tool Call: ${tc.name} with args: ${JSON.stringify(tc.args)}`);
                }
            }
            console.log("\n");
        }
    } catch (e) {
        console.error("Error parsing line:", e);
    }
});
