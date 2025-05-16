import React, { useState } from 'react';
import './TeamRankings.css';

const TeamRankings = ({ rankings }) => {
  // Add state to track expanded team details
  const [expandedTeam, setExpandedTeam] = useState(null);
  
  // Early return if no data is available
  if (!rankings || !rankings.data || rankings.data.length === 0) {
    return <div className="loading">Loading rankings...</div>;
  }
  
  // Function to toggle team details expansion
  const toggleTeamDetails = (teamRank) => {
    if (expandedTeam === teamRank) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamRank);
    }
  };
  
  // Render an individual team card
  const renderTeamCard = (team) => {
    const isExpanded = expandedTeam === team.RANK;
    const rankChange = calculateRankChange(team.RANK, team["PREVIOUS RANK"]);
    
    return (
      <div 
        key={team.RANK}
        className={`team-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => toggleTeamDetails(team.RANK)}
      >
        {/* Add prominent rank badge */}
        <div className="team-rank-badge">{team.RANK}</div>
        
        <div className="team-card-header">
          <div className="team-info">
            <div className="team-name">{team.COLLEGE}</div>
            {/* Emphasize win-loss record as main stat */}
            <div className="team-record">{team.RECORD}</div>
          </div>
          
          {rankChange !== null && (
            <span className={`rank-change ${rankChange.direction}`}>
              {rankChange.symbol} {Math.abs(rankChange.value)}
            </span>
          )}
          
          <div className="team-points">
            <span className="points-value">{team.POINTS}</span>
            <span className="points-label">Points</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="team-details">
            <div className="team-detail-row">
              <span className="detail-label">Previous Rank:</span>
              <span className="detail-value">{team["PREVIOUS RANK"] || "N/A"}</span>
            </div>
            <div className="team-detail-row">
              <span className="detail-label">Win-Loss Record:</span>
              <span className="detail-value">{team.RECORD}</span>
            </div>
            <div className="detail-hint">Tap to collapse</div>
          </div>
        )}
        
        {!isExpanded && (
          <div className="expand-hint">Tap for details</div>
        )}
      </div>
    );
  };
  
  // Helper function to calculate rank change
  const calculateRankChange = (currentRank, previousRank) => {
    if (!previousRank || previousRank === "-") return null;
    
    const current = parseInt(currentRank);
    const previous = parseInt(previousRank);
    
    if (isNaN(current) || isNaN(previous)) return null;
    
    const change = previous - current;
    
    if (change === 0) return { value: 0, direction: 'same', symbol: '→' };
    if (change > 0) return { value: change, direction: 'improved', symbol: '↑' };
    return { value: Math.abs(change), direction: 'dropped', symbol: '↓' };
  };
  
  return (
    <div className="team-rankings">
      <h2>D1 College Softball Rankings</h2>
      
      <div className="rankings-cards-container">
        {rankings.data.map(renderTeamCard)}
      </div>
      
      <div className="update-info">
        <p>Source: {rankings.title}</p>
        <p>Last Updated: {rankings.updated}</p>
      </div>
    </div>
  );
};

export default TeamRankings;