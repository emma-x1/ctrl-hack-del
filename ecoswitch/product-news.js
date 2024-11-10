require('dotenv').config();

const OpenAI = require("openai");
const openai = new OpenAI();

async function fetchNews(productName) {
    const query = `Provide three bullet points summarizing the most recent news about ${productName}, with a special focus on sustainability. Use reputable, third-party sources and include both positive and negative sources. For each bullet point, please cite your source.`;

    try {
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {"role": "user", "content": query }
            ]
        });

        const output = completion.choices[0].message.content.trim();
        console.log(output);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

(async () => {
    await fetchNews("PepsiCo");
})();

