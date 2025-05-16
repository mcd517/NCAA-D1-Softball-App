import React, { useState, useEffect } from 'react';
import './TeamRankings.css';

const TeamRankings = ({ rankings }) => {
  const [isMobileCardView, setIsMobileCardView] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileDevice(window.innerWidth <= 480);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Early return if no data is available
  if (!rankings || !rankings.data || rankings.data.length === 0) {
    return <div className="loading">Loading rankings...</div>;
  }

  return (
    <div className="team-rankings">
      {isMobileDevice && (
        <div className="toggle-view-mode">
          <button 
            className={`toggle-btn ${!isMobileCardView ? 'active' : ''}`}
            onClick={() => setIsMobileCardView(false)}
          >
            Table View
          </button>
          <button 
            className={`toggle-btn ${isMobileCardView ? 'active' : ''}`}
            onClick={() => setIsMobileCardView(true)}
          >
            Card View
          </button>
        </div>
      )}
      
      <div className={`rankings-table-container ${isMobileCardView ? 'mobile-card-view' : ''}`}>
        <table className="rankings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th className="team-column">Team</th>
              <th>Record</th>
              <th>Points</th>
              <th>Previous Rank</th>
            </tr>
          </thead>
          <tbody>
            {rankings.data.map((item) => (
              <tr key={item.RANK}>
                <td className="rank" data-label="Rank">{item.RANK}</td>
                <td className="team" data-label="Team">
                  <span>{item.COLLEGE}</span>
                </td>
                <td data-label="Record">{item.RECORD}</td>
                <td data-label="Points">{item.POINTS}</td>
                <td data-label="Previous">{item["PREVIOUS RANK"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="update-info">
          <p>Source: {rankings.title}</p>
          <p>Last Updated: {rankings.updated}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamRankings;