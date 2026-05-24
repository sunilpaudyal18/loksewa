const fs = require('fs');
const path = require('path');

async function testUpload() {
    const qPath = path.join(__dirname, '..', 'public', 'test', 'q2.jpeg');
    const ansPath = path.join(__dirname, '..', 'public', 'test', 'ans1.jpeg');

    if (!fs.existsSync(qPath) || !fs.existsSync(ansPath)) {
        console.error("Test images not found!");
        return;
    }

    const qBuffer = fs.readFileSync(qPath);
    const ansBuffer = fs.readFileSync(ansPath);

    const formData = new FormData();
    // In Node.js 18+ FormData.append accepts a Blob/File. 
    // We can convert Buffer to Blob.
    const qBlob = new Blob([qBuffer], { type: 'image/jpeg' });
    const ansBlob = new Blob([ansBuffer], { type: 'image/jpeg' });

    formData.append('questions', qBlob, 'q2.jpeg');
    formData.append('answerKey', ansBlob, 'ans1.jpeg');

    console.log("Sending POST request to http://localhost:3000/api/upload...");
    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        console.log("Response Status:", response.status);
        const text = await response.text();
        console.log("Response Body:", text);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testUpload();
