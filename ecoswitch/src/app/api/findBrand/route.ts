import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure the OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("The OPENAI_API_KEY environment variable is missing.");
}

const client = new OpenAI({ apiKey });

const INSTRUCTIONS = 'You are a parent brand identifier. Given a brand and/or manufacturer of a product, search the web to find its parent brand and output it on its own with no additional explanation or quotation marks.';

export async function POST(req: NextRequest) {
  try {
    const { brand, manufacturer } = await req.json();

    // Ensure a sentence is provided
    if (!brand && !manufacturer || (typeof brand !== 'string' || typeof manufacturer !== 'string')) {
      return NextResponse.json(
        { success: false, failedReason: 'No sentence provided or invalid format', answer: '' },
        { status: 400 }
      );
    }

    // Call OpenAI API to get the corrected sentence
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: INSTRUCTIONS,
        },
        {
          role: 'user',
          content: `${brand}, ${manufacturer}`,
        },
      ],
      max_tokens: 1000,
    });

    const rawAnswer = completion.choices?.[0]?.message?.content || 'No response from OpenAI.';

    // Return the AI's response (corrected sentence)
    return NextResponse.json(
      {
        success: true,
        answer: rawAnswer,
      },
      { status: 200 }
    );
  } catch (error) {
    // Fixing the object syntax in the catch block and closing the return statement correctly
    return NextResponse.json(
      {
        success: false,
        failedReason: (error as Error).message,
        answer: '',
      },
      { status: 500 }
    );
  }
}
