require('dotenv').config();

const OpenAI = require("openai");
const openai = new OpenAI();

async function findAlternatives(keyword) {
    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06", 
    messages: [
        { role: "system", 
            content: `Please find a product related to the keyword 'water bottle' from one of the following brands: ['Schneider Electric', 'Siemens', 'Vestas Wind Systems', 'Unilever', 'Stantec', 'Tesla', 'BYD', 'Essity', 'SABIC', 'Capgemini', 'Ford Motor', 'BASF', 'Alstom', 'Samsung SDI', 'IBM', 'Orsted', 'Accenture', 'AbbVie', 'Apple', 'IKEA', 'Patagonia', 'Microsoft', 'ArcelorMittal', 'H&M', 'Heineken', 'Bayer', 'Vodafone', 'GSK', 'Walmart', 'Nestle', 'Coca-Cola', 'Danone', 'PepsiCo', 'Johnson & Johnson', 'Target', 'Nike', 'McDonald's', 'Pfizer', 'General Electric', 'Procter & Gamble', 'Airbus', 'Shell', 'ExxonMobil', 'L'Oréal', 'TotalEnergies', 'Citi', 'HSBC', 'JPMorgan Chase', 'Wells Fargo', 'BNP Paribas', 'Goldman Sachs', 'Morgan Stanley', 'AT&T', 'Intel', 'Qualcomm', 'Cisco', 'LVMH', 'Johnson Controls', 'General Motors', 'Fiat Chrysler Automobiles', 'BMW', 'Volkswagen', 'Daimler', 'Peugeot', 'Siemens Gamesa', 'ABB', 'Kroger', 'T-Mobile', 'Toyota', 'Huawei', 'Mitsubishi', 'Samsung', 'Macquarie'].
`}
    ],
});

const news = completion.choices[0].message.parsed;
console.log(news);

}

findAlternatives('orange juice');