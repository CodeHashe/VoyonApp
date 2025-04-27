export default async function fetchWikiSummary(title) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      return data.extract;
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      return null;
    }
  }
  