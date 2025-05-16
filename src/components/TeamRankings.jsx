import React from 'react';
import './TeamRankings.css';

const TeamRankings = ({ rankings }) => {
  // Early return if no data is available
  if (!rankings || !rankings.data || rankings.data.length === 0) {
    return <div className="loading">Loading rankings...</div>;
  }

  return (
    <div className="team-rankings">
      <div className="rankings-table-container">
        <table className="rankings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th className="team-column">Team</th>
              <th>Record</th>
              <th>Points</th>
              <th>Previous</th>
            </tr>
          </thead>
          <tbody>
            {rankings.data.map((item) => (
              <tr key={item.RANK}>
                <td className="rank">{item.RANK}</td>
                <td className="team">
                  <span>{item.COLLEGE}</span>
                </td>
                <td>{item.RECORD}</td>
                <td>{item.POINTS}</td>
                <td>{item["PREVIOUS RANK"]}</td>
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