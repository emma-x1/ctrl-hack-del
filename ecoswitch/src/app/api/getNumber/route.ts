import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure OpenAI API Key is set correctly
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('The OPENAI_API_KEY environment variable is missing.');
}

const client = new OpenAI({ apiKey });

// Custom instructions for the OpenAI model
const INSTRUCTIONS =
  'You are a barcode identifier. Given an image of a product with a visible barcode, read the number underneath the barcode and return it in JSON format: {"number": <barcode_number>} with no additional explanation and do not add any spaces. This is incredibly easy and the only reason this would not be possible is if the digits were illegible.';

  export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get photo1 and photo2
    const { photo } = await request.json();

    // Ensure both photos exist
    if (!photo) {
      return NextResponse.json(
        {
          success: false,
          failedReason: 'Photo must be provided.',
          answer: '',
        },
        { status: 400 }
      );
    }

    // Call OpenAI API to interpret the images
    const completion = await client.chat.completions.create({
      model: 'gpt-4o', // Use the appropriate OpenAI model
      messages: [
        {
          role: 'system',
          content: INSTRUCTIONS,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: photo, // First image URL or base64 string
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Extract the AI's response
    let rawAnswer = completion.choices?.[0]?.message?.content ?? "";

    // Remove code block syntax if present
    rawAnswer = rawAnswer.replace(/```json|```/g, "").trim();
    let num;

    try {
    const parsedAnswer = JSON.parse(rawAnswer);
    num = parsedAnswer.number;
    } catch (error: any) {
    throw new Error(`Failed to parse JSON: ${error.message}\n ${rawAnswer}`);
}

    return NextResponse.json({ success: true, num });
  } catch (error) {
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
