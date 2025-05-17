import axios from 'axios';

// Detect if running in Capacitor (iOS/Android app)
const isCapacitor = !!window.Capacitor || window.location.protocol === 'capacitor:';

// Detect if running on a real device (not simulator)
const isRealDevice = isCapacitor && (
  // iOS-specific check for real device
  (window.Capacitor?.getPlatform?.() === 'ios' && 
   !window.navigator.userAgent.includes('Mac')) || 
  // Android always counts as real device
  window.Capacitor?.getPlatform?.() === 'android'
);

// Get the environment-appropriate API URL
const API_BASE_URL = (() => {
  // For local simulator testing - use localhost or 192.168.x.x
  if (isCapacitor && !isRealDevice) {
    return 'http://localhost:5003/api/softball'; 
  }
  
  // For production apps on real devices - use Netlify function
  if (isRealDevice || import.meta.env.PROD) {
    return '/.netlify/functions/api';
  }
  
  // For local development in browser
  return 'http://localhost:5003/api/softball';
})();

console.log('Frontend connecting to backend at:', API_BASE_URL);
console.log('Is Capacitor app:', isCapacitor);
console.log('Is real device:', isRealDevice);
console.log('Is production build:', import.meta.env.PROD);

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