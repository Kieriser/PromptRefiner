import { NextRequest, NextResponse } from 'next/server';

interface RefinedPrompt {
  id: string;
  refined: string;
  clarity: number;
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    // Use user's API key if provided, otherwise fall back to environment variable
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not provided' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI prompt refinement expert. Given a user's prompt, provide 1-3 refined versions that are more clear, specific, and effective.

For each refinement, provide:
1. A refined version of the prompt
2. A clarity score from 1-10 (10 being most clear and specific)
3. A brief, helpful explanation of why this refinement is better

Make explanations engaging and sometimes humorous (inspired by Grok's style). Focus on common prompt improvement techniques like:
- Adding context and specificity
- Clarifying the desired format or length
- Including examples when helpful
- Specifying the audience or use case

Return your response as a JSON object with this structure:
{
  "suggestions": [
    {
      "id": "1",
      "refined": "refined prompt text",
      "clarity": 8,
      "explanation": "Brief explanation of why this is better"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original prompt: "${prompt}"` }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      // Fallback: create a basic response if JSON parsing fails
      parsedResponse = {
        suggestions: [
          {
            id: '1',
            refined: `Be more specific about what you want to know: "${prompt.trim()}" - what particular aspect interests you most?`,
            clarity: 6,
            explanation: "Adding specificity helps get more targeted and useful responses."
          }
        ]
      };
    }

    // Validate and sanitize the response
    const suggestions: RefinedPrompt[] = (parsedResponse.suggestions || [])
      .slice(0, 3)
      .map((suggestion: { id?: string; refined?: string; clarity?: number; explanation?: string }, index: number) => ({
        id: suggestion.id || `${index + 1}`,
        refined: suggestion.refined || prompt,
        clarity: Math.max(1, Math.min(10, suggestion.clarity || 5)),
        explanation: suggestion.explanation || "General improvement suggestion."
      }));

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Error refining prompt:', error);
    return NextResponse.json(
      { error: 'Failed to refine prompt' },
      { status: 500 }
    );
  }
}