require('dotenv').config();

const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");

const openai = new OpenAI();

const newsOutput = z.object({
   content1: z.object({ text: z.string(), }),
   source1: z.object({ }),
   content2: z.object({ text: z.string(),}),
   source2: z.object({ }),
   content3: z.object({ text: z.string(),}),
   source3: z.object({ }),
}).strict();

async function fetchNews(productName) {
    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06", 
    messages: [
        { role: "system", 
            content: `Provide three bullet points summarizing the most recent news about ${productName}, with a special focus on sustainability. Use reputable, third-party sources and include both positive and negative sources. For each bullet point, please provide the corresponding source URL. The response should contain 'content1', 'content2', and 'content3', with the summary content, and 'source1', 'source2', and 'source3', with the source URLs. Provide the bullet points in the following format: [Content] (Source URL).`}
    ],
    response_format: zodResponseFormat(newsOutput, "news"),
});

const news = completion.choices[0].message.parsed;
console.log(news);

}

fetchNews('PepsiCo');