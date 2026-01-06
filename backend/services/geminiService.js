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
        - "outcomes": array of long strings (provide detailed and comprehensive explanations of key outcomes)
        - "decisions": array of strings (briefly state any final decisions made)
        - "actionItems": array of objects with "task", "owner", and "deadline" keys
        - "risks": array of strings (identify potential risks, open questions, or uncertainties)
        - "nextSteps": array of strings (list clear next steps or future agenda items)

        Guidelines:
        - Be factual but comprehensive for outcomes.
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

// ... (existing functions)

/**
 * Agent 4: WhatsApp Audio Summarization Agent
 */
async function summarizeWhatsApp(text, language = 'English') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Summarize the following WhatsApp audio transcript in ${language} into structured JSON.
        Format the response as a JSON object with these EXACT keys:
        - "summary": string (a concise summary of the audio note)
        - "immediateActions": array of strings (clear, immediate actions required, if any)

        Guidelines:
        - Keep it brief and direct, suitable for a quick read.
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
        console.error("WhatsApp Summarization Error:", error);
        throw error;
    }
}

// ... (existing functions)

/**
 * Agent 5: Meeting Preparation Agent
 */
async function generateMeetingBrief(topic, participants) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1beta" });

        // 1. Research Participants (Parallel)
        const researchPromises = participants.map(p => researchParticipant(p.name, p.email, p.company));
        const researchResults = await Promise.all(researchPromises);

        const researchSummary = participants.map((p, i) => `
        Person: ${p.name} (${p.company})
        Research: ${researchResults[i]}
        `).join('\n\n');

        // 2. Generate Brief
        const prompt = `
        Prepare a meeting brief for the following topic: "${topic}"

        Participants Research:
        ${researchSummary}

        Generate a structured JSON response with:
        - "brief": string (Executive summary of the context and participants)
        - "talkingPoints": array of strings (Strategic points to discuss based on participant backgrounds)
        - "questions": array of strings (Insightful questions to ask specific participants)
        - "icebreakers": array of strings (Personalized icebreakers based on research)

        Return ONLY the raw JSON object.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();

        // Robust cleanup: find first '{' and last '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            content = content.substring(firstBrace, lastBrace + 1);
        }

        // Handle Gemini returning json markdown wrapping
        // content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim(); // Legacy

        let briefData;
        try {
            briefData = JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error. Raw content:", content);
            throw new Error("Failed to parse AI response");
        }

        return JSON.stringify({
            briefData: briefData,
            researchResults: participants.map((p, i) => ({
                name: p.name,
                email: p.email,
                company: p.company,
                data: researchResults[i]
            }))
        });

    } catch (error) {
        console.error("Meeting Preparation Error:", error);
        throw error;
    }
}

module.exports = {
    transcribeAudio,
    summarizeText,
    researchParticipant,
    summarizeWhatsApp,
    generateMeetingBrief
};
