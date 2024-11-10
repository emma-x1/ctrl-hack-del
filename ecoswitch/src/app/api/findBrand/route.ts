import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure the OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
const apiKeyBar = process.env.BARCODE_API_KEY;
if (!apiKey) {
  throw new Error("The OPENAI_API_KEY environment variable is missing.");
}
if (!apiKeyBar) {
  throw new Error("The BARCODE_API_KEY environment variable is missing.");
}

const client = new OpenAI({ apiKey });

const INSTRUCTIONS = 'You are a parent brand identifier. Given a brand and/or manufacturer of a product, search the web to find its parent brand and output it on its own with no additional explanation or quotation marks.';

export async function POST(req: NextRequest) {
  try {
    const { barcode } = await req.json();

    // Ensure the URL is provided
    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'Barcode must be provided and must be a string', answer: '' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${apiKeyBar}`);
    if (!response.ok) {
      return NextResponse.json(
        { success: false, failedReason: `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${apiKeyBar}`, answer: '' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const firstProduct = data.products?.[0];

    // Extract brand and manufacturer from the first product in the array
    const brand = firstProduct?.brand || '';
    const manufacturer = firstProduct?.manufacturer || '';
    const title = firstProduct?.title || '';

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
        title: title
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
