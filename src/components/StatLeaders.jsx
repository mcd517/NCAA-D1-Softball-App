import React, { useState } from 'react';
import './StatLeaders.css';

const StatLeaders = ({ statData, activeCategory, onCategoryChange }) => {
  // Add state to track expanded player details
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  
  const categories = [
    // Batting Categories
    { id: 'batting', label: 'Batting AVG', group: 'batting' },
    { id: 'hits', label: 'Hits', group: 'batting' },
    { id: 'homeRuns', label: 'Home Runs', group: 'batting' },
    { id: 'obp', label: 'On-Base %', group: 'batting' },
    { id: 'slg', label: 'Slugging %', group: 'batting' },
    
    // Pitching Categories
    { id: 'era', label: 'ERA', group: 'pitching' },
    { id: 'strikeoutsPerSeven', label: 'K/7 Innings', group: 'pitching' },
    { id: 'strikeoutsTotal', label: 'Strikeouts', group: 'pitching' }
  ];
  
  const handleCategoryChange = (categoryId) => {
    if (onCategoryChange) {
      setExpandedPlayer(null); // Reset expanded player when changing category
      onCategoryChange(categoryId);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = 
    !statData || 
    statData.isLoading || 
    !Array.isArray(statData.leaders) || 
    statData.leaders.length === 0;
    
  // Function to toggle player details expansion
  const togglePlayerDetails = (playerId) => {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(playerId);
    }
  };
  
  // Filter categories by group to display them in separate sections
  const battingCategories = categories.filter(cat => cat.group === 'batting');
  const pitchingCategories = categories.filter(cat => cat.group === 'pitching');
  
  // Horizontal scrolling category tabs for better mobile experience
  const renderCategoryTabs = () => (
    <div className="category-container">
      <div className="category-scroll-container">
        <div className="category-group">
          <h4 className="category-group-title">Batting</h4>
          <div className="scroll-tabs">
            {battingCategories.map(category => (
              <button 
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="category-group">
          <h4 className="category-group-title">Pitching</h4>
          <div className="scroll-tabs">
            {pitchingCategories.map(category => (
              <button 
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Format value based on category
  const formatValue = (value, category) => {
    switch(category) {
      case 'batting':
      case 'obp':
      case 'slg':
        // Format with 3 decimal places for percentages
        return typeof value === 'number' ? value.toFixed(3).replace(/^0+/, '') : value;
      case 'era':
        // Format with 2 decimal places for ERA
        return typeof value === 'number' ? value.toFixed(2) : value;
      default:
        return value;
    }
  };

  // Get the stat label based on category
  const getStatLabel = () => {
    switch(activeCategory) {
      case 'batting': return 'AVG';
      case 'hits': return 'Hits';
      case 'homeRuns': return 'HR';
      case 'obp': return 'OB%';
      case 'slg': return 'SLG%';
      case 'era': return 'ERA';
      case 'strikeoutsTotal': return 'SO';
      case 'strikeoutsPerSeven': return 'K/7';
      default: return 'Value';
    }
  };

  // Render a card for each stat leader
  const renderStatLeaderCard = (leader) => {
    const isExpanded = expandedPlayer === `${leader.rank}-${leader.player.name}`;
    const additionalStats = leader.additionalStats || {};
    const playerId = `${leader.rank}-${leader.player.name}`;
    
    // Get relevant stats based on category
    let relevantStats = [];
    
    switch(activeCategory) {
      case 'batting':
        relevantStats = [
          { label: 'Games', value: additionalStats.g || '-' },
          { label: 'At Bats', value: additionalStats.ab || '-' },
          { label: 'Hits', value: additionalStats.h || '-' }
        ];
        break;
      case 'hits':
        relevantStats = [
          { label: 'Games', value: additionalStats.g || '-' },
          { label: 'Batting AVG', value: additionalStats.avg ? additionalStats.avg.toFixed(3).replace(/^0+/, '') : '-' }
        ];
        break;
      case 'homeRuns':
        relevantStats = [
          { label: 'Games', value: additionalStats.g || '-' },
          { label: 'HR/Game', value: additionalStats.hr_g ? additionalStats.hr_g.toFixed(2) : '-' }
        ];
        break;
      case 'obp':
        relevantStats = [
          { label: 'Games', value: additionalStats.g || '-' },
          { label: 'At Bats', value: additionalStats.ab || '-' },
          { label: 'Hits', value: additionalStats.h || '-' },
          { label: 'Walks', value: additionalStats.bb || '-' },
          { label: 'HBP', value: additionalStats.hbp || '-' }
        ];
        break;
      case 'slg':
        relevantStats = [
          { label: 'Games', value: additionalStats.g || '-' },
          { label: 'At Bats', value: additionalStats.ab || '-' },
          { label: 'Total Bases', value: additionalStats.tb || '-' }
        ];
        break;
      case 'era':
        relevantStats = [
          { label: 'Appearances', value: additionalStats.app || '-' },
          { label: 'Innings', value: additionalStats.ip || '-' },
          { label: 'Earned Runs', value: additionalStats.er || '-' }
        ];
        break;
      case 'strikeoutsPerSeven':
        relevantStats = [
          { label: 'Appearances', value: additionalStats.app || '-' },
          { label: 'Innings', value: additionalStats.ip || '-' },
          { label: 'Strikeouts', value: additionalStats.so || '-' }
        ];
        break;
      case 'strikeoutsTotal':
        relevantStats = [
          { label: 'Appearances', value: additionalStats.app || '-' },
          { label: 'Innings', value: additionalStats.ip || '-' }
        ];
        break;
      default:
        break;
    }

    return (
      <div 
        key={playerId}
        className={`stat-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => togglePlayerDetails(playerId)}
      >
        <div className="stat-card-header">
          <span className="rank">{leader.rank}</span>
          <div className="player-info">
            <div className="player-name">{leader.player.name}</div>
            <div className="player-team">{leader.team.name}</div>
          </div>
          <div className="stat-value-container">
            <div className="stat-value">{formatValue(leader.value, activeCategory)}</div>
            <div className="stat-label">{getStatLabel()}</div>
          </div>
        </div>
        
        <div className="card-details">
          <div className="player-metadata">
            <span className="meta-item">
              <span className="meta-label">Class:</span> {leader.player.classYear || 'N/A'}
            </span>
            <span className="meta-item">
              <span className="meta-label">Position:</span> {leader.player.position || 'N/A'}
            </span>
          </div>
          
          {isExpanded && (
            <div className="additional-stats">
              {relevantStats.map((stat, index) => (
                <div className="stat-row" key={index}>
                  <span className="stat-row-label">{stat.label}:</span>
                  <span className="stat-row-value">{stat.value}</span>
                </div>
              ))}
              <div className="expand-hint">Tap to collapse</div>
            </div>
          )}
          
          {!isExpanded && (
            <div className="expand-hint">Tap for details</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="stat-leaders">
      <h2>D1 College Softball Statistical Leaders</h2>
      
      {/* Always show category tabs */}
      {renderCategoryTabs()}
      
      {isLoading ? (
        <div className="loading">Loading statistical leaders...</div>
      ) : (
        <>
          <h3 className="category-title">{statData.category}</h3>
          
          <div className="stat-cards-container">
            {statData.leaders.map(renderStatLeaderCard)}
          </div>
          
          <div className="update-info">
            <p>Data Source: NCAA.com</p>
            <p>Last Updated: {statData.updated || new Date().toLocaleDateString()}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default StatLeaders;