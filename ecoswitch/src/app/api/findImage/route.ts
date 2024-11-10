import axios from 'axios';

const findImage = async (searchTerm: string): Promise<string> => {
  try {
    const subscriptionKey = process.env.NEXT_PUBLIC_BING_SEARCH_API_KEY as string;
    const endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';

    const response = await axios.get(endpoint, {
      params: { q: searchTerm, count: 1 },
      headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey },
    });

    if (response.data.value && response.data.value.length > 0) {
      const firstImageResult = response.data.value[0];
      return firstImageResult.contentUrl;
    } else {
      throw new Error('No images found.');
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

export default findImage;
