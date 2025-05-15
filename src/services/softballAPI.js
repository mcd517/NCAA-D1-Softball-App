import axios from 'axios';
import { Platform } from 'react-native';

// Determine the API base URL based on platform and environment
const getApiBaseUrl = () => {
  // For React Native mobile apps
  if (Platform.OS !== 'web') {
    // Use actual server URL or IP for non-web platforms
    // For iOS simulator, use localhost
    // For physical devices, use your computer's IP address (not localhost)
    return Platform.OS === 'ios' ? 
      'http://localhost:5003/api/softball' : 
      'http://10.0.2.2:5003/api/softball'; // Android emulator special IP for host machine
  }
  
  // For web - use the same logic as before
  const isProd = process.env.NODE_ENV === 'production';
  return isProd 
    ? '/.netlify/functions/api' 
    : 'http://localhost:5003/api/softball';
};

const API_BASE_URL = getApiBaseUrl();

console.log('Frontend connecting to backend at:', API_BASE_URL);
console.log('Platform:', Platform.OS);

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