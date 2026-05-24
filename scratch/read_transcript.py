import json
import os

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\80dea17a-dd8f-4e43-94d3-eb7d0fc2126a\.system_generated\logs\transcript.jsonl"

if not os.path.exists(transcript_path):
    print("Transcript not found at", transcript_path)
    exit(1)

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get("step_index", 0)
            source = data.get("source", "")
            type_ = data.get("type", "")
            content = data.get("content", "")
            
            # Print only relevant steps (say steps from 150 onwards, or all user input / model responses)
            if step >= 150 or source == "USER_EXPLICIT":
                print(f"=== STEP {step} | {source} | {type_} ===")
                if content:
                    # Strip long system messages or truncate if too large
                    content_str = content.strip()
                    if len(content_str) > 1000:
                        content_str = content_str[:1000] + "... (truncated)"
                    print(content_str)
                if "tool_calls" in data and data["tool_calls"]:
                    for tc in data["tool_calls"]:
                        print(f"  Tool Call: {tc.get('name')} with args: {tc.get('args')}")
                print()
        except Exception as e:
            print("Error parsing line:", e)
