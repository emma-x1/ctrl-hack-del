import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure OpenAI API Key is set correctly
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing.');
}

const client = new OpenAI({ apiKey });

// Custom instructions for the OpenAI model
const INSTRUCTIONS = 'You are tasked with finding a more sustainable alternative to the following product: Respond with just the product name and absolutely nothing else at all. Then, give 3 bullet points identifying why it is a better alternative. Print this in and return it in JSON format with each value below the comma: {"altname": <altname>, "bullet1": "<bullet1>", "bullet2": <bullet2>, "bullet3": <bullet3>}'

export async function POST(req: NextRequest) {
  try {
    const { product } = await req.json();

    if (!product || typeof product !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'Product name must be provided and must be a string', answer: '' },
        { status: 400 }
      );
    }
    // Call OpenAI API to interpret the images
    const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: INSTRUCTIONS,
          },
          {
            role: 'user',
            content: product,
          },
        ],
        max_tokens: 1000,
      });

    // Extract the AI's response
    const rawAnswer = completion.choices?.[0]?.message?.content as string;
    // const answer = JSON.parse(rawAnswer);

    // const alt = answer?.altname || '';
    // const bp1 = answer?.bullet1 || '';
    // const bp2 = answer?.bullet2 || '';
    // const bp3 = answer?.bullet3 || '';

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

