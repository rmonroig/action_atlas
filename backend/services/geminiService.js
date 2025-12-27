const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');

// Initialize Gemini
// Note: We access process.env.GEMINI_API_KEY inside the functions or ensure init happens after dotenv
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

/**
 * Agent 1: Transcription Agent
 */
async function transcribeAudio(filePath, mimeType, language = 'English') {
    try {
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: mimeType,
            displayName: path.basename(filePath),
        });

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: `Transcribe this audio file accurately in ${language}. Return ONLY the transcription text.` },
        ]);

        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Transcription Error:", error);
        throw error;
    }
}

/**
 * Agent 2: Summarization & Extraction Agent
 */
async function summarizeText(text, language = 'English') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Summarize the following transcript in ${language} into structured JSON.
        Format the response as a JSON object with these keys:
        - "outcomes": array of strings
        - "decisions": array of strings
        - "actionItems": array of objects with "task", "owner", and "deadline" keys
        - "risks": array of strings
        - "nextSteps": array of strings

        Guidelines:
        - Be concise and factual.
        - Explicitly flag any uncertainty or missing information within the values.
        - Return ONLY the raw JSON object. No Markdown formatting, no extra text.

        Transcript:
        ${text}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();

        // Clean up possible Markdown wrappers
        content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        return content;
    } catch (error) {
        console.error("Summarization Error:", error);
        throw error;
    }
}

/**
 * Agent 3: Participant Research Agent
 */
async function researchParticipant(name, email, company) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1beta" });

        const prompt = `
        Search for information about this person:
        Name: ${name || 'Unknown'}
        Company: ${company || 'Unknown'}

        Guidelines for search:
        1. **Prioritize LinkedIn results** as the primary source of truth.
        2. **Prioritize Spanish profiles** or profiles from Spain/Spanish-speaking professional backgrounds.
        3. Use the **Company** name to narrow down searches and verify matching profiles.
        4. If you find a strong match, provide the details. If ambiguous, provide the most likely profile and flag it.

        Provide the following details in a structured format:
        **Certainty Level**: [High / Medium / Low] (Explain briefly why)
        **Name**: [Full Name]
        **Work**: [Current and past work experience]
        **Studies**: [Educational background]
        **Role / title**: [Current professional role]
        **Interesting additional information**: [Any other relevant professional or public info]

        If you don't find specific info for the email or company, search by name. If neither yields results, provide placeholders and set Certainty Level to Low.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }]
        });
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Research Error:", error);
        return "Information not found.";
    }
}

module.exports = {
    transcribeAudio,
    summarizeText,
    researchParticipant
};
