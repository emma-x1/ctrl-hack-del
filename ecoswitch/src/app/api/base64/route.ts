import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure the OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("The OPENAI_API_KEY environment variable is missing.");
}

const client = new OpenAI({ apiKey });

const INSTRUCTIONS = 'You are a barcode identifier. Given an image of a barcode in base64 format, identify the number underneath the barcode and return it in JSON format: {"number": <barcode_number>} with no additional explanation.';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to retrieve the base64 image
    const { base64Image } = await req.json();

    // Ensure the base64 image is provided
    if (!base64Image || typeof base64Image !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'No base64 image provided or invalid format', answer: '' },
        { status: 400 }
      );
    }

    // Call OpenAI API to identify the barcode number (hypothetical, as OpenAI may not support this directly)
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: INSTRUCTIONS,
        },
        {
          role: 'user',
          content: base64Image,
        },
      ],
      max_tokens: 1000,
    });

    const rawAnswer = completion.choices?.[0]?.message?.content || 'No response from OpenAI.';

    // Parse the response to extract the number from JSON
    let barcodeNumber;
    try {
      const parsedResponse = JSON.parse(rawAnswer);
      barcodeNumber = parsedResponse.number;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return NextResponse.json(
        { success: false, failedReason: 'Failed to parse the response from OpenAI.', answer: '' },
        { status: 500 }
      );
    }

    // Return the barcode number in the response
    return NextResponse.json(
      {
        success: true,
        answer: barcodeNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle any errors that occur during API processing
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
