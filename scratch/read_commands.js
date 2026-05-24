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
        
        if (data.tool_calls && data.tool_calls.length > 0) {
            for (const tc of data.tool_calls) {
                if (tc.name === 'run_command') {
                    console.log(`Step ${step}: ${JSON.stringify(tc.args)}`);
                }
            }
        }
    } catch (e) {
        console.error("Error parsing line:", e);
    }
});
