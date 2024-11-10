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

const INSTRUCTIONS = 'You are tasked with finding a more sustainable alternative to the following product: Respond with the alternative product name and absolutely nothing else at all. Cross reference a list of 5 alternatives presented following the brand name item. Note the corresponding thumbnails afterwards in respective order. Of the 5, return the most likely to be sustainable. Use both the name and link to determine the brand of each alternative. If it is not clear, a telltale sign of sustainability is if the item is a lesser known brand, but still a brand with a name. Never choose a corporation owned brand unless you are positive it is sustainable, and NEVER choose a product made by the same brand as the original product. Then, give 3 bullet points identifying why it is a better alternative. Give real reasons that directly relate to sustainability, nothing anecdotal. Print this in and return it in JSON format with each value below the comma: {"altname": <altname>, "thumbnail": <thumbnail> "bullet1": "<bullet1>", "bullet2": <bullet2>, "bullet3": <bullet3>}';

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

    const links = [];
    links.push(data.results[0].url);
    links.push(data.results[1].url);
    links.push(data.results[2].url);
    links.push(data.results[3].url);
    links.push(data.results[4].url);

    const thumbnails = [];
    thumbnails .push(data.results[0].thumbnail);
    thumbnails .push(data.results[1].thumbnail);
    thumbnails .push(data.results[2].thumbnail);
    thumbnails .push(data.results[3].thumbnail);
    thumbnails .push(data.results[4].thumbnail);

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
          content: `Original: ${product}. Alternatives: ${products[0]}, ${products[1]}, ${products[2]}, ${products[3]}, ${products[4]}. Corresponding Link: ${links[0]}, ${links[1]}, ${links[2]}, ${links[3]}, ${links[4]}. Corresponding Thumbnail: ${thumbnails[0]}, ${thumbnails[1]}, ${thumbnails[2]}, ${thumbnails[3]}, ${thumbnails[4]}`,
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
