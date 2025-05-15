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
      batting: '/stats/softball/d1/current/individual/271', // Batting Average
      hits: '/stats/softball/d1/current/individual/1088',    // Hits
      homeRuns: '/stats/softball/d1/current/individual/514', // Home Runs
      obp: '/stats/softball/d1/current/individual/510',      // On-Base Percentage
      slg: '/stats/softball/d1/current/individual/343',      // Slugging Percentage
      era: '/stats/softball/d1/current/individual/276',      // Earned Run Average
      strikeoutsPerSeven: '/stats/softball/d1/current/individual/278', // Strikeouts Per Seven Innings
      strikeouts: '/stats/softball/d1/current/individual/539'  // Strikeouts (Total)
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

      // Category-specific mapping based on ncaaWebScraper.js and StatLeaders.jsx requirements
      switch (category) {
        case 'batting': // Batting Average
          value = parseFloat(item.BA || item.AVG || item.avg || item.ba) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.ab = parseInt(item.AB || item.ab) || 0;
          stats.h  = parseInt(item.H  || item.h)  || 0;
          break;
        case 'hits':
          value = parseInt(item.H || item.h) || 0;
          stats.g = parseInt(item.G || item.g) || 0;
          break;
        case 'homeRuns':
          value = parseInt(item.HR || item.hr) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.hr = parseInt(item.HR || item.hr) || 0; // For HR/G calculation
          stats.hr_g = stats.g > 0 ? parseFloat((stats.hr / stats.g).toFixed(2)) : 0;
          break;
        case 'obp': // On-Base Percentage
          // The API (id:510) should provide OBP directly. Components H,BB,HBP,AB,G are for display.
          value = parseFloat(item.OBP || item.obp || item.Value || item.value) || 0;
          stats.g   = parseInt(item.G   || item.g)   || 0;
          stats.ab  = parseInt(item.AB  || item.ab)  || 0;
          stats.h   = parseInt(item.H   || item.h)   || 0;
          stats.bb  = parseInt(item.BB  || item.bb)  || 0;
          stats.hbp = parseInt(item.HBP || item.hbp) || 0;
          // SF (Sacrifice Flies) might be needed if calculating OBP manually, but API usually provides it.
          // stats.sf  = parseInt(item.SF  || item.sf)  || 0;
          break;
        case 'slg': // Slugging Percentage
          // The API (id:343) should provide SLG directly. Components G,AB,H,2B,3B,HR are for display.
          value = parseFloat(item.SLG || item.slg || item.Value || item.value) || 0;
          stats.g    = parseInt(item.G    || item.g)    || 0;
          stats.ab   = parseInt(item.AB   || item.ab)   || 0;
          stats.h    = parseInt(item.H    || item.h)    || 0;
          stats['2b'] = parseInt(item['2B'] || item['2b'] || item.DOUBLE) || 0;
          stats['3b'] = parseInt(item['3B'] || item['3b'] || item.TRIPLE) || 0;
          stats.hr   = parseInt(item.HR   || item.hr)   || 0;
          break;
        case 'era': // Earned Run Average
          value = parseFloat(item.ERA || item.era) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          stats.er  = parseInt(item.ER || item.er)  || 0;
          break;
        case 'strikeoutsPerSeven': // K/7
          value = parseFloat(item['K/7'] || item.K7 || item.Value || item.value) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          stats.so  = parseInt(item.SO  || item.so)   || 0;
          break;
        case 'strikeouts': // Total Strikeouts (maps from 'strikeoutsTotal' in UI)
          value = parseInt(item.SO || item.so || item.Value || item.value) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          break;
        default:
          // Fallback for any unhandled category, though all should be covered.
          value = parseFloat(item.Value || item.value) || 0;
          // Attempt to grab common fields if they exist
          if (item.G !== undefined || item.g !== undefined) stats.g = parseInt(item.G || item.g) || 0;
          if (item.AB !== undefined || item.ab !== undefined) stats.ab = parseInt(item.AB || item.ab) || 0;
          if (item.H !== undefined || item.h !== undefined) stats.h = parseInt(item.H || item.h) || 0;
          break;
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