import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure the OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
const apiKeyAmazon = process.env.AMAZON_API_KEY;
if (!apiKey) {
  throw new Error("The OPENAI_API_KEY environment variable is missing.");
}
if (!apiKeyAmazon) {
  throw new Error("The BARCODE_API_KEY environment variable is missing.");
}

const client = new OpenAI({ apiKey });

const INSTRUCTIONS = 'You are tasked with finding a more sustainable alternative to the following product: Respond with the alternative product name and absolutely nothing else at all. Cross reference a list of 5 alternatives I present following the brand name item. Of the 5, return the most likely to be sustainable. If it is not clear, a telltale sign is if the item is a lesser known brand. Never choose a corporation owned brand unless you are positive it is sustainable, and NEVER choose a product made by the same brand as the original product. Then, give 3 bullet points identifying why it is a better alternative. Print this in and return it in JSON format with each value below the comma: {"altname": <altname>, "bullet1": "<bullet1>", "bullet2": <bullet2>, "bullet3": <bullet3>}';

export async function POST(req: NextRequest) {
  try {
    const { product } = await req.json();

    // Ensure the URL is provided
    if (!product || typeof product !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'Product must be provided and must be a string', answer: '' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://data.unwrangle.com/api/getter/?platform=amazon_search&search=sustainable%20${encodeURIComponent(product)}&country_code=ca&page=1&api_key=${apiKeyAmazon}`);
    if (!response.ok) {
      return NextResponse.json(
        { success: false, failedReason: `sss`, answer: '' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const products = [];
    products.push(data.results[0].name);
    products.push(data.results[1].name);
    products.push(data.results[2].name);
    products.push(data.results[3].name);
    products.push(data.results[4].name);

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
          content: `Original: ${product}. Alternatives: ${products[0]}, ${products[1]}, ${products[2]}, ${products[3]}, ${products[4]}.`,
        },
      ],
      max_tokens: 1000,
    });

    const rawAnswer = completion.choices?.[0]?.message?.content || 'No response from OpenAI.';
    const answer = JSON.parse(rawAnswer);

    // Return the AI's response (corrected sentence)
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
