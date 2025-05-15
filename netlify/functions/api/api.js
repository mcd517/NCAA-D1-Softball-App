const axios = require('axios');

// NCAA API client with proper configuration
const ncaaApiClient = axios.create({
  baseURL: 'https://ncaa-api.henrygd.me',
  timeout: 15000,
  headers: {
    'User-Agent': 'College Softball App/1.0'
  }
});

/**
 * NCAA API Service for Netlify Functions
 * Simplified version of the ncaaWebScraper service
 */
class NCAAService {
  constructor() {
    // Use the current 'current/individual/{id}' endpoints for live data
    this.statsUrls = {
      batting: '/stats/softball/d1/current/individual/271',
      hits: '/stats/softball/d1/current/individual/1088',
      homeRuns: '/stats/softball/d1/current/individual/514',
      obp: '/stats/softball/d1/current/individual/510',
      slg: '/stats/softball/d1/current/individual/343',
      era: '/stats/softball/d1/current/individual/276',
      strikeoutsPerSeven: '/stats/softball/d1/current/individual/278',
      strikeouts: '/stats/softball/d1/current/individual/539'
    };
    
    // Last request timestamp to enforce rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  /**
   * Wait for rate limit to avoid IP blocks
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch team rankings using NCAA API
   */
  async fetchRankings() {
    await this.respectRateLimit();
    try {
      console.log('Fetching rankings from NCAA API');
      const { data } = await ncaaApiClient.get('/rankings/softball/d1');
      return {
        title: data.title || 'NCAA Division I Softball Rankings',
        updated: data.updated || new Date().toLocaleDateString(),
        data: Array.isArray(data.data) ? data.data : []
      };
    } catch (error) {
      console.error('Error fetching rankings from NCAA API:', error.message);
      throw error;
    }
  }

  /**
   * Fetch statistics data using NCAA API
   */
  async fetchStats(category) {
    const endpoint = this.statsUrls[category];
    if (!endpoint) throw new Error(`Invalid category: ${category}`);
    await this.respectRateLimit();
    try {
      console.log(`Fetching ${category} stats from NCAA API`);
      const { data } = await ncaaApiClient.get(endpoint);
      return this.formatStatsData(data, category);
    } catch (error) {
      console.error(`Error fetching ${category} stats from NCAA API:`, error.message);
      throw error;
    }
  }

  /**
   * Format stats JSON from NCAA API to our application format
   */
  formatStatsData(apiData, category) {
    const result = {
      sport: 'Softball',
      category: this.getCategoryTitle(category),
      updated: apiData.updated || new Date().toLocaleDateString(),
      leaders: []
    };
    
    if (!apiData.data || !Array.isArray(apiData.data)) return result;

    apiData.data.slice(0, 50).forEach((item, index) => {
      let rank = parseInt(item.Rank || item.rank) || index + 1;
      let value = 0;
      const stats = {};

      // Category-specific mapping
      switch (category) {
        case 'batting':
          value = parseFloat(item.BA || item.AVG || item.avg || item.ba) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.ab = parseInt(item.AB || item.ab) || 0;
          stats.h  = parseInt(item.H  || item.h)  || 0;
          break;
        case 'homeRuns':
          value = parseInt(item.HR || item.hr) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          break;
        case 'era':
          value = parseFloat(item.ERA || item.era) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          break;
        default:
          value = parseFloat(item.Value || item.value) || 0;
      }

      result.leaders.push({
        rank,
        player: { 
          name: item.Name || item.name || '', 
          position: item.Position || item.POS || item.pos || '', 
          classYear: item.Cl || item.cl || '' 
        },
        team: { name: item.Team || item.TEAM || item.team || '' },
        value,
        additionalStats: stats
      });
    });

    return result;
  }

  /**
   * Get a display-friendly title for a stat category
   */
  getCategoryTitle(category) {
    const titles = {
      batting: 'Batting Average',
      hits: 'Hits',
      homeRuns: 'Home Runs',
      obp: 'On-Base Percentage',
      slg: 'Slugging Percentage',
      era: 'Earned Run Average',
      strikeoutsPerSeven: 'Strikeouts Per Seven Innings',
      strikeouts: 'Strikeouts'
    };
    
    return titles[category] || 'Statistical Leaders';
  }
}

// Create instance of the service
const ncaaService = new NCAAService();

/**
 * Netlify serverless function handler
 */
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  // Parse path for endpoint and parameters
  const path = event.path.replace('/.netlify/functions/api', '');
  const segments = path.split('/').filter(Boolean);
  
  try {
    // Handle different API endpoints
    if (segments[0] === 'rankings') {
      const rankings = await ncaaService.fetchRankings();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rankings)
      };
    } else if (segments[0] === 'stats' && segments[1]) {
      const category = segments[1];
      const stats = await ncaaService.fetchStats(category);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error', 
        message: error.message 
      })
    };
  }
};