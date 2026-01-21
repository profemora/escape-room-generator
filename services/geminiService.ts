import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EscapeRoomData } from '../types';

export const generateEscapeRoomContent = async (text: string): Promise<EscapeRoomData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Define the detailed schema for the response
  // All descriptions updated to ensure content is in ENGLISH
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy title for the escape room in ENGLISH." },
      introText: { type: Type.STRING, description: "A short introductory story in ENGLISH." },
      mcqSet1: {
        type: Type.ARRAY,
        description: "First set of 10 Multiple Choice Questions in ENGLISH.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "Question string in ENGLISH" },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly 4 options in ENGLISH. One correct, three clearly wrong (no ambiguous answers)." },
            correctIndex: { type: Type.INTEGER, description: "The index (0-3) of the correct answer. MUST BE RANDOM." }
          },
          required: ["question", "options", "correctIndex"]
        }
      },
      mcqSet2: {
        type: Type.ARRAY,
        description: "Second set of 10 Multiple Choice Questions in ENGLISH.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "Question string in ENGLISH" },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly 4 options in ENGLISH. One correct, three clearly wrong (no ambiguous answers)." },
            correctIndex: { type: Type.INTEGER, description: "The index (0-3) of the correct answer. MUST BE RANDOM." }
          },
          required: ["question", "options", "correctIndex"]
        }
      },
      matchingSet1: {
        type: Type.ARRAY,
        description: "First matching activity (7 pairs) in ENGLISH.",
        items: {
          type: Type.OBJECT,
          properties: {
            left: { type: Type.STRING, description: "Start of sentence or concept in ENGLISH" },
            right: { type: Type.STRING, description: "End of sentence or definition in ENGLISH" }
          },
          required: ["left", "right"]
        }
      },
      matchingSet2: {
        type: Type.ARRAY,
        description: "Second matching activity (7 pairs) in ENGLISH.",
        items: {
          type: Type.OBJECT,
          properties: {
            left: { type: Type.STRING, description: "Item 1 in ENGLISH" },
            right: { type: Type.STRING, description: "Item 2 in ENGLISH" }
          },
          required: ["left", "right"]
        }
      },
      fillGap: {
        type: Type.OBJECT,
        description: "Fill in the gap activity (8 items) in ENGLISH.",
        properties: {
          textWithPlaceholders: { type: Type.STRING, description: "The full text in ENGLISH with exactly 8 occurrences of '[GAP]'. Ensure spelling is perfect." },
          answers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The 8 correct words in order in ENGLISH." },
          distractors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 extra wrong words in ENGLISH. If testing spelling/grammar, use plausible mistakes." }
        },
        required: ["textWithPlaceholders", "answers"]
      },
      openQuestions: {
        type: Type.ARRAY,
        description: "2 Open-ended Critical Thinking questions in ENGLISH.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The question in ENGLISH" },
            modelAnswer: { type: Type.STRING, description: "A concise correct model answer in ENGLISH" }
          },
          required: ["question", "modelAnswer"]
        }
      }
    },
    required: ["title", "introText", "mcqSet1", "mcqSet2", "matchingSet1", "matchingSet2", "fillGap", "openQuestions"]
  };

  const prompt = `
    You are an expert educational content creator.
    Create an "Escape Room" educational game based on the text provided below.
    
    LANGUAGE RULES:
    ALL CONTENT MUST BE IN ENGLISH.
    Translate concepts from the source text into English if the source text is in another language.
    
    The content must follow these exact rules:
    1. Two sets of 10 Multiple Choice Questions (MCQ) each in ENGLISH. Each MCQ must have 4 options. The position of the correct answer (0, 1, 2, or 3) MUST vary randomly.
    2. IMPORTANT: For MCQs, ensure the 3 incorrect options (distractors) are clearly wrong. Do not use ambiguous options.
    3. Two Matching activities with 7 pairs each in ENGLISH.
    4. One "Fill in the Gap" (Cloze test) activity IN ENGLISH. 
       - The text must have exactly 8 gaps marked as [GAP].
       - CRITICAL: Ensure strict English grammatical accuracy.
       - SPECIAL GRAMMAR CHECK: 
         * VERBS ENDING IN 'Y': When adding '-ING', the 'Y' NEVER changes. (e.g. Study -> Studying, Play -> Playing). Do NOT change y to i.
         * INVARIANT IRREGULAR VERBS: These verbs do not change form (e.g., Hurt -> Hurt, Hit -> Hit, Put -> Put, Cut -> Cut).
         * If the source text explains a grammar rule or exception, the generated text MUST test these specific cases accurately.
    5. Two Open-ended questions requiring critical thinking in ENGLISH.
    
    SOURCE TEXT:
    ${text}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("No content generated");
  }

  return JSON.parse(jsonText) as EscapeRoomData;
};