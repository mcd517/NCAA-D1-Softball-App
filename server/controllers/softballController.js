/**
 * Controller for handling NCAA softball data requests
 * Simplified to focus on rankings and stats
 */
const ncaaScraper = require('../services/ncaaWebScraper');
const ncaaService = require('../services/ncaaService');

// Cache for storing responses
const cache = {
  rankings: {
    data: null,
    timestamp: 0
  },
  stats: {},
  games: {}
};

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) * 1000 : 3600000;

// Utility to check if cache is still valid
const isCacheValid = (timestamp) => {
  return (Date.now() - timestamp) < CACHE_TTL;
};

const softballController = {
  /**
   * Get team rankings (ESPN poll)
   */
  async getTeamRankings(req, res) {
    try {
      // Check if we have valid cached data
      if (process.env.CACHE_ENABLED !== 'false' && 
          cache.rankings.data && 
          isCacheValid(cache.rankings.timestamp)) {
        console.log('Serving rankings from cache');
        return res.status(200).json(cache.rankings.data);
      }

      console.log('Fetching team rankings from NCAA API');
      const rankings = await ncaaScraper.fetchRankings();
      
      // Cache the result
      cache.rankings = {
        data: rankings,
        timestamp: Date.now()
      };
      
      res.status(200).json(rankings);
    } catch (error) {
      console.error('Error fetching rankings:', error.message);
      
      // Try to use the fallback service if main scraper fails
      try {
        console.log('Attempting to use fallback NCAA service for rankings');
        const fallbackRankings = await ncaaService.getMockRankings();
        res.status(200).json(fallbackRankings);
      } catch (fallbackError) {
        console.error('Fallback service also failed:', fallbackError.message);
        res.status(500).json({ 
          error: 'Failed to fetch live rankings', 
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  },

  /**
   * Get statistical leaders
   */
  async getStatLeaders(req, res) {
    const { category } = req.params;
    const categoryMapping = {
      batting: 'batting',
      hits: 'hits',
      homeRuns: 'homeRuns',
      obp: 'obp',
      slg: 'slg',
      era: 'era',
      strikeoutsPerSeven: 'strikeoutsPerSeven',
      strikeoutsTotal: 'strikeouts'
    };
    const validCategory = categoryMapping[category] || 'batting';

    try {
      // Check if we have valid cached data for this category
      if (process.env.CACHE_ENABLED !== 'false' && 
          cache.stats[validCategory] && 
          isCacheValid(cache.stats[validCategory].timestamp)) {
        console.log(`Serving ${validCategory} stats from cache`);
        return res.status(200).json(cache.stats[validCategory].data);
      }

      console.log(`Fetching ${validCategory} stat leaders from NCAA API`);
      const stats = await ncaaScraper.fetchStats(validCategory);
      
      // Cache the result
      cache.stats[validCategory] = {
        data: stats,
        timestamp: Date.now()
      };
      
      res.status(200).json(stats);
    } catch (error) {
      console.error(`Error fetching ${validCategory} stats:`, error.message);
      
      // Try to use cached data even if it's expired, as a fallback
      if (cache.stats[validCategory] && cache.stats[validCategory].data) {
        console.log(`Using expired cache for ${validCategory} stats as fallback`);
        return res.status(200).json({
          ...cache.stats[validCategory].data,
          fromCache: true,
          cacheTimestamp: new Date(cache.stats[validCategory].timestamp).toISOString()
        });
      }
      
      // If no cache, try the fallback service
      try {
        console.log(`Attempting to use fallback NCAA service for ${validCategory} stats`);
        const mockStats = await ncaaService.getMockStats(validCategory);
        res.status(200).json(mockStats);
      } catch (fallbackError) {
        console.error('Fallback service also failed:', fallbackError.message);
        res.status(500).json({ 
          error: `Failed to fetch live ${validCategory} stats`, 
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  },
  
  /**
   * Get games/scoreboard
   */
  async getGames(req, res) {
    const { date = 'current' } = req.params;
    
    try {
      // Check if we have valid cached data for this date
      if (process.env.CACHE_ENABLED !== 'false' && 
          cache.games[date] && 
          isCacheValid(cache.games[date].timestamp)) {
        console.log(`Serving games for ${date} from cache`);
        return res.status(200).json(cache.games[date].data);
      }

      console.log(`Fetching games for ${date} from NCAA API`);
      const gamesData = await ncaaService.getGames(date);
      
      // Cache the result
      cache.games[date] = {
        data: gamesData,
        timestamp: Date.now()
      };
      
      res.status(200).json(gamesData);
    } catch (error) {
      console.error(`Error fetching games for ${date}:`, error.message);
      
      // Try to use cached data even if it's expired, as a fallback
      if (cache.games[date] && cache.games[date].data) {
        console.log(`Using expired cache for ${date} games as fallback`);
        return res.status(200).json({
          ...cache.games[date].data,
          fromCache: true,
          cacheTimestamp: new Date(cache.games[date].timestamp).toISOString()
        });
      }
      
      // If no cache, use the fallback mock data
      try {
        console.log('Serving mock games data as fallback');
        const mockGames = await ncaaService.getMockGames();
        res.status(200).json(mockGames);
      } catch (fallbackError) {
        console.error('Fallback mock also failed:', fallbackError.message);
        res.status(500).json({ 
          error: `Failed to fetch games for ${date}`, 
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};

module.exports = softballController;