import axios from 'axios';

// Backend API URL - points to our Express server
const API_BASE_URL = 'http://localhost:5003/api/softball';

console.log('Frontend connecting to backend at:', API_BASE_URL);

// Create axios instance for our backend with longer timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000 // 30 seconds to account for puppeteer/scraping time
});

/**
 * Fetch team rankings (ESPN poll)
 */
export const fetchTeamRankings = async () => {
  try {
    console.log('Frontend: Fetching team rankings from backend...');
    const response = await apiClient.get('/rankings');
    console.log('Frontend: Received team rankings with', response.data?.data?.length || 0, 'teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching team rankings:', error.message);
    throw error;
  }
};

/**
 * Fetch statistical leaders
 */
export const fetchStatLeaders = async (category = 'batting') => {
  try {
    console.log(`Frontend: Fetching ${category} stats from backend...`);
    const response = await apiClient.get(`/stats/${category}`);
    console.log('Frontend: Received stats data with', response.data?.leaders?.length || 0, 'players');
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} stats:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};