/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getPerformanceAdvice(performanceData: any) {
  const prompt = `
    As an expert NEET MDS mentor, analyze these simulated exam results and provide the best possible solution for improvement.
    
    Data:
    Strongest Subjects: ${performanceData.strongSubjects.join(', ')}
    Weakest Subjects: ${performanceData.weakSubjects.join(', ')}
    Average Score: ${performanceData.averageScore}%
    Time Management Index: ${performanceData.timeRating}
    
    Provide:
    1. A strategic study plan for the next 2 weeks.
    2. Specific tips for weak subjects.
    3. Motivation for the candidate.
    Keep the response concise and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-1.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error('Gemini error:', error);
    if (error.status === 'RESOURCE_EXHAUSTED' || error.code === 429) {
      throw new Error('BUDGET_EXCEEDED');
    }
    return "Focus on consistent practice in your weak areas. Regular revision of high-yield topics in Oral Pathology and Pharmacology will significantly boost your percentile.";
  }
}
