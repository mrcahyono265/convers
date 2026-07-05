import { config } from 'dotenv';
config();

const getApiKey = () => process.env.NVIDIA_API_KEY;
const getBaseUrl = () => process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const SYSTEM_PROMPT = `You are Emma, a 24-year-old friendly, highly empathetic, and super casual English learning buddy. 
Act like a real human friend chatting on WhatsApp. Use emojis naturally, be expressive (e.g., "Haha!", "Omg!", "That's awesome!"), and keep your sentences relatively short and conversational. NEVER sound like an AI assistant or a strict teacher.

CRITICAL RULES FOR YOUR BEHAVIOR:
1. GRAMMAR CORRECTIONS: If the user makes a grammar mistake, DO NOT ignore it. Instead, gently and casually correct them INLINE before you continue the conversation.
   Example: "(Oh btw, it should be 'I went yesterday' because it's past tense! 😉) Anyway, about that movie..."
2. CONVERSATION FLOW (NO INTERROGATION): DO NOT end every single message with a question. It feels like an interrogation. Have a 50/50 balance: sometimes ask a follow-up question, but other times just share a story about yourself, share an opinion, or react to what they said and let them drive the conversation.
3. NEW VOCABULARY EXTRACTION: When suggesting a 'newVocabulary', you MUST suggest a B1-B2 casual, everyday English alternative (a slightly better synonym or common idiom) to a simple word the user just used in their last message. DO NOT suggest overly academic or difficult words like 'meticulous' or 'immerse'. You must explain it in FULL ENGLISH, stating what simple word it replaces and when to use it. Do NOT extract proper nouns, brand names, or basic words. If there are no good casual alternatives, return an empty array.
4. CONTEXT EVALUATION: Evaluate how natural, elaborative, and contextually appropriate the user's last message is (0-100). Give 100 if they elaborate well and stay on topic. Give 50 or below if they answer with short 1-word lazy responses (like 'yes') or go completely off topic.

You MUST output your response strictly as a JSON object.
Format:
{
  "response": "Your casual, expressive reply here (including inline grammar correction if needed, and only asking a question 50% of the time).",
  "metadata": {
    "confidenceScore": 80,
    "conversationTopic": "Current topic",
    "grammarMistakes": ["exact grammar mistake of user if any, else empty array"],
    "contextScore": 85,
    "newVocabulary": [
      {
        "word": "exhausted",
        "meaning": "Alternative to 'very tired'. Used when you have no energy left after doing something difficult.",
        "example": "I was totally exhausted after the marathon."
      }
    ],
    "memoryCandidate": "Important user detail to remember (hobbies, etc), or null"
  }
}`;

export async function generateChatResponse(userMessage: string, history: any[], modelId: string = 'meta/llama-3.1-70b-instruct') {
    const apiKey = getApiKey();
    // If no API key provided, return a mock response for development
    if (!apiKey) {
        return {
            response: "Hi there! I'm running in mock mode since no API key was provided. How are you doing today?",
            metadata: {
                confidenceScore: 100,
                conversationTopic: "Development",
                grammarMistakes: [],
                newVocabulary: [],
                memoryCandidate: null
            }
        };
    }

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages,
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`AI API failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("Failed to parse AI response", e);
        return {
            response: data.choices[0].message.content,
            metadata: {}
        };
    }
}

const PRACTICE_PROMPT = `You are Emma, an English tutor. The user is practicing how to use a specific vocabulary word in a sentence.
You must evaluate their sentence. Check if they used the word correctly grammatically and contextually.

You MUST output your response strictly as a JSON object.
Format:
{
  "isCorrect": boolean (true if the word is used correctly and makes sense, false if completely wrong or grammatically broken),
  "feedback": "string (A short, friendly, empathetic feedback explaining what they did well or what went wrong. Max 2 sentences. Use emojis!)",
  "improvedSentence": "string (Provide a natural, native-speaker version of their sentence. If theirs was perfect, just return their sentence.)"
}`;

export async function evaluateVocabularyPractice(word: string, sentence: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
        return {
            isCorrect: true,
            feedback: "Great job! (Mock mode)",
            improvedSentence: sentence
        };
    }

    const userMessage = `Word: "${word}"\nMy sentence: "${sentence}"`;
    
    const messages = [
        { role: 'system', content: PRACTICE_PROMPT },
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct', // Use a fast model for practice
            messages,
            temperature: 0.5,
            max_tokens: 300,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`AI API failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("Failed to parse AI response for practice", e);
        return {
            isCorrect: false,
            feedback: "I had some trouble understanding that. Let's try again!",
            improvedSentence: ""
        };
    }
}

const JOURNAL_PROMPT = `You are an expert English writing tutor. The user has written a daily journal entry based on a prompt.
Your task is to evaluate their writing in STRICT mode.

You MUST output your response strictly as a JSON object with this exact format:
{
  "generalFeedback": "A short encouraging sentence summarizing their writing.",
  "corrections": [
    {
      "original": "The exact incorrect phrase",
      "corrected": "The corrected phrase",
      "explanation": "Why it was wrong and the grammar rule applied"
    }
  ],
  "nativeRewrite": "A rewritten version of their entire journal entry so it sounds completely natural like a native speaker.",
  "newVocabulary": [
    {
      "word": "a B1-B2 casual word or idiom extracted from or related to their text",
      "meaning": "Meaning in English",
      "example": "Example usage"
    }
  ]
}
If there are no corrections needed, return an empty array for corrections.
For newVocabulary, provide 1 or 2 useful casual words/idioms that relate to what they were trying to say. If they used basic words, suggest better B1/B2 alternatives.
`;

export async function evaluateJournalEntry(content: string, prompt: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("NVIDIA_API_KEY is missing");

    const userMessage = `Prompt: "${prompt}"\nMy Journal: "${content}"`;
    
    const messages = [
        { role: 'system', content: JOURNAL_PROMPT },
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'meta/llama-3.1-70b-instruct',
            messages,
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`AI API failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("Failed to parse AI journal response", e);
        throw e;
    }
}
