async function testProcess() {
    const jobId = "94b587ee-8b7b-4567-9f8a-c80fb6f59162";
    console.log(`Sending POST request to http://localhost:3000/api/process for jobId: ${jobId}...`);
    try {
        const response = await fetch('http://localhost:3000/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jobId,
                title: "Test Set Q2",
                subject: "General Knowledge",
                year: "2080"
            })
        });

        console.log("Response Status:", response.status);
        const text = await response.text();
        console.log("Response Body:", text);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testProcess();
