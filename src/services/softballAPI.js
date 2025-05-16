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
  
  // For web - use Vite's import.meta.env instead of process.env
  const isProd = import.meta.env.PROD;
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
  timeout: 30000, // 30 seconds to account for puppeteer/scraping time
  retry: 3, // Allow 3 retries for failed requests
  retryDelay: 1000, // Wait 1 second between retries
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Requesting: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for retry logic and error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // If config is undefined or we've already retried the maximum times, reject
    if (!config || !config.retry) {
      return Promise.reject(error);
    }
    
    // Set a counter for retries
    config.__retryCount = config.__retryCount || 0;
    
    // If we haven't hit the max retries, retry the request
    if (config.__retryCount < config.retry) {
      config.__retryCount += 1;
      console.log(`Retrying request (${config.__retryCount}/${config.retry}): ${config.url}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

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
    // Return reasonable default/fallback data
    return {
      title: 'NCAA Division I Softball Rankings',
      updated: new Date().toLocaleDateString(),
      data: []
    };
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
    
    // Return reasonable default/fallback data
    return {
      sport: 'Softball',
      category: getCategoryTitle(category),
      updated: new Date().toLocaleDateString(),
      leaders: []
    };
  }
};

/**
 * Fetch games/scoreboard data
 */
export const fetchGames = async (date = 'current') => {
  try {
    console.log(`Frontend: Fetching games for date: ${date}`);
    const response = await apiClient.get(`/games/${date}`);
    console.log('Frontend: Received games data with', response.data?.games?.length || 0, 'games');
    return response.data;
  } catch (error) {
    console.error(`Error fetching games for ${date}:`, error.message);
    
    // Return reasonable default/fallback data
    return {
      title: 'NCAA Division I Softball Scoreboard',
      date: new Date().toLocaleDateString(),
      updated: new Date().toLocaleTimeString(),
      games: []
    };
  }
};

// Helper function to get category title
const getCategoryTitle = (category) => {
  const titles = {
    batting: 'Batting Average',
    hits: 'Hits',
    homeRuns: 'Home Runs',
    obp: 'On-Base Percentage',
    slg: 'Slugging Percentage',
    era: 'Earned Run Average',
    strikeoutsPerSeven: 'Strikeouts Per Seven Innings',
    strikeoutsTotal: 'Strikeouts'
  };
  
  return titles[category] || 'Statistical Leaders';
};