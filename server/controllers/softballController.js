/**
 * Controller for handling NCAA softball data requests
 * Simplified to focus on rankings and stats
 */
const ncaaScraper = require('../services/ncaaWebScraper');

const softballController = {
  /**
   * Get team rankings (ESPN poll)
   */
  async getTeamRankings(req, res) {
    try {
      console.log('Fetching team rankings from NCAA API');
      const rankings = await ncaaScraper.fetchRankings();
      res.status(200).json(rankings);
    } catch (error) {
      console.error('Error fetching rankings:', error.message);
      res.status(500).json({ error: 'Failed to fetch live rankings', message: error.message });
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
      console.log(`Fetching ${validCategory} stat leaders from NCAA API`);
      const stats = await ncaaScraper.fetchStats(validCategory);
      res.status(200).json(stats);
    } catch (error) {
      console.error(`Error fetching ${validCategory} stats:`, error.message);
      res.status(500).json({ error: 'Failed to fetch live stats', message: error.message });
    }
  }
};

module.exports = softballController;