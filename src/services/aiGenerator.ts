import { GoogleGenAI } from "@google/genai";
import { supabase } from "../lib/supabase";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function generateQuestionsFromPYQs(subjectId: string, year: string, count: number): Promise<any[]> {
    // 1. Fetch PYQ questions from Supabase for this subject and year
    const { data: pyqs, error } = await supabase
        .from('questions')
        .select('text, options, correct_option, explanation, topic')
        .eq('subject_id', subjectId)
        .eq('year', year)
        .limit(10); // Use a subset of PYQs as context
    
    if (error) throw new Error('Failed to fetch PYQ context: ' + error.message);
    
    const pyqContext = JSON.stringify(pyqs);

    const prompt = `Act as a dental medical exam expert. Generate ${count} new, high-quality, authentic multiple-choice questions for the subject: ${subjectId} (${year} level).
    Use the following previous year questions as context and style guide:
    ${pyqContext}
    
    Return the result as a strictly formatted JSON array of objects with fields: 
    text (string), 
    options (array of 4 strings), 
    correctOption (integer 0-3), 
    explanation (string), 
    topic (string).
    
    Ensure the questions are original and not verbatim copies of the PYQs.`;
    
    // 2. Call Gemini
    const model = ai.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    
    // 3. Parse and return
    // Remove Markdown formatting code blocks if present in response
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
}
