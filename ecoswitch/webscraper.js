const cheerio = require('cheerio');

(async () => {
    const url = 'https://medium.com/@joerosborne/intro-to-web-scraping-build-your-first-scraper-in-5-minutes-1c36b5c4b110';
    const response = await fetch(url);

    const $ = cheerio.load(await response.text());
    console.log($.html());

    const text = $('p').text();
    console.log(text);

})();