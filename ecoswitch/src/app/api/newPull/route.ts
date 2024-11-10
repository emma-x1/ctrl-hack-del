import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure OpenAI API Key is set correctly
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing.');
}

const client = new OpenAI({ apiKey });

// Custom instructions for the OpenAI model
const INSTRUCTIONS = 'Search the web for recent news about a given brand, with a focus on sustainability. From 3 of the articles you find, generate a bullet point summarizing each. Use reputable, third-party sources and you MUST include both positive and negative sources. Do not under any circumstance use the brand itself as source, search for something else. For each article, please provide a short summary of the info and the name of the source, with no addtional content returned. The response must be in the strict JSON format {"article1" : {"summary" : <summary>, "source" : <source news>}, "article2" : {"summary" : <summary>, "source" : <source news>}, "article3" : {"summary" : <summary>, "source" : <source news>}';

export async function POST(req: NextRequest) {
  try {
    const { brand } = await req.json();

    if (!brand || typeof brand !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'Brand name must be provided and must be a string', answer: '' },
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
            content: brand,
          },
        ],
        max_tokens: 1000,
      });

    // Extract the AI's response
    const rawAnswer = completion.choices?.[0]?.message?.content as string;
    const answer = JSON.parse(rawAnswer);

    //const grade = answer?.altname || '';
    // const alt = answer?.altname || '';
    // const bp1 = answer?.bullet1 || '';
    // const bp2 = answer?.bullet2 || '';
    // const bp3 = answer?.bullet3 || '';

    return NextResponse.json(
      {
        success: true,
        answer: answer,
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

