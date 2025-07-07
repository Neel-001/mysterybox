import { NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

export async function POST() {
  try {
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY!,
    });
    const prompt =
      `Generate exactly three unique, open-ended, and friendly questions for an anonymous social messaging platform. Each question must:
      - Be suitable for all ages and backgrounds
      - Encourage positive, thoughtful, or fun conversation
      - Avoid personal, sensitive, or controversial topics
      - Be phrased as a question and end with a question mark
      
      Output ONLY the three questions, separated by '||' (no numbering, no extra text, no quotes, no intro or outro). Example output:
      What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?`;

    const response = await cohere.generate({
      model: 'command',
      prompt,
      maxTokens: 100,
      temperature: 0.7,
    });

    // Ensure the output is always three questions separated by '||'
    let text = response.generations[0].text.trim();
    // Remove leading/trailing quotes or whitespace
    text = text.replace(/^['"\s]+|['"\s]+$/g, '');
    // Split by '||' and filter for real questions
    let questions = text.split('||').map(q => q.trim()).filter(q => q.length > 10 && /[?]$/.test(q));
    // If not exactly 3, fallback to static suggestions
    if (questions.length !== 3) {
      questions = [
        "What's your favorite book?",
        "If you could travel anywhere, where would you go?",
        "What's a skill you'd love to learn?"
      ];
    }
    const formatted = questions.join('||');
    return NextResponse.json({ suggestions: formatted });
  } catch (error) {
    console.error('Cohere API error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}