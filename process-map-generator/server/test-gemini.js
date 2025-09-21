const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
    try {
        console.log('Testing Gemini API key...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found in environment variables');
            return;
        }

        console.log('API Key format:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Sending test request...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'Hello, say "API key is working!" if you can read this.' }] }],
        });

        const response = result.response.text();
        console.log('✅ API key is valid!');
        console.log('Response:', response);

    } catch (error) {
        console.error('❌ API key test failed:');
        console.error('Error:', error.message);

        if (error.message.includes('API_KEY_INVALID')) {
            console.log('\n🔍 How to get a valid Gemini API key:');
            console.log('1. Go to: https://aistudio.google.com/app/apikey');
            console.log('2. Sign in with your Google account');
            console.log('3. Click "Create API Key"');
            console.log('4. Copy the key that starts with "AIza..."');
            console.log('5. Update your .env file with: GEMINI_API_KEY=your-new-key');
        }
    }
}

testGeminiAPI();