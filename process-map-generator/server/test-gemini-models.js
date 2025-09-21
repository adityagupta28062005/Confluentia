const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiModels() {
    try {
        console.log('🔍 Testing available Gemini models...\n');

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found');
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Available Gemini models as of 2024
        const modelsToTest = [
            'gemini-1.5-pro',           // Most capable, higher limits
            'gemini-1.5-flash',         // Fast and efficient (current)
            'gemini-pro',               // Previous generation
            'gemini-1.0-pro-latest',    // Latest 1.0 version
        ];

        const testPrompt = "Analyze this simple business process: 'Customer submits invoice, manager approves, finance processes payment.' Return a brief JSON with steps.";

        for (const modelName of modelsToTest) {
            try {
                console.log(`📋 Testing ${modelName}...`);

                const model = genAI.getGenerativeModel({ model: modelName });
                const startTime = Date.now();

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1000,
                    },
                });

                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const response = result.response.text();

                console.log(`✅ ${modelName} - SUCCESS`);
                console.log(`   Response time: ${responseTime}ms`);
                console.log(`   Response length: ${response.length} characters`);
                console.log(`   Sample response: ${response.substring(0, 100)}...\n`);

            } catch (error) {
                console.log(`❌ ${modelName} - FAILED`);
                console.log(`   Error: ${error.message}\n`);
            }
        }

        console.log('🎯 RECOMMENDATIONS:');
        console.log('• gemini-1.5-pro: Best for complex analysis, higher token limits');
        console.log('• gemini-1.5-flash: Best for speed and efficiency (current choice)');
        console.log('• gemini-pro: Good balance, stable');
        console.log('\n📊 MODEL COMPARISON:');
        console.log('Model             | Speed    | Quality  | Token Limit | Cost');
        console.log('gemini-1.5-pro   | Medium   | Highest  | 2M tokens   | Higher');
        console.log('gemini-1.5-flash | Fastest  | High     | 1M tokens   | Lower');
        console.log('gemini-pro       | Fast     | Good     | 32K tokens  | Lowest');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testGeminiModels();