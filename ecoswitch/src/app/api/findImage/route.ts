import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ImageSearchProps {
  searchTerm: string;
}

const findImage: React.FC<ImageSearchProps> = ({ searchTerm }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchImage = async () => {
      if (!searchTerm) {
        setImageUrl('');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const subscriptionKey = process.env.REACT_APP_BING_SEARCH_API_KEY as string;
        const endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';

        const response = await axios.get(endpoint, {
          params: { q: searchTerm, count: 1 },
          headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey },
        });

        if (response.data.value && response.data.value.length > 0) {
          const firstImageResult = response.data.value[0];
          setImageUrl(firstImageResult.contentUrl);
        } else {
          setError('No images found.');
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setError('Error fetching image.');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [searchTerm]);
};

export default findImage;
