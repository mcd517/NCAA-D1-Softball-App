import React from 'react';
import './TeamRankings.css';

const TeamRankings = ({ rankings }) => {
  // Early return if no data is available
  if (!rankings || !rankings.data || rankings.data.length === 0) {
    return (
      <div className="loading" role="status" aria-live="polite">
        Loading rankings...
      </div>
    );
  }

  return (
    <div className="team-rankings">
      <div className="rankings-table-container">
        <table 
          className="rankings-table" 
          role="table" 
          aria-label="NCAA D1 College Softball Team Rankings"
        >
          <caption className="sr-only">
            NCAA D1 College Softball Team Rankings table showing rank, team name, record, points, and previous rank
          </caption>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col" className="team-column">Team</th>
              <th scope="col">Record</th>
              <th scope="col">Points</th>
              <th scope="col">Previous Rank</th>
            </tr>
          </thead>
          <tbody>
            {rankings.data.map((item) => (
              <tr key={item.RANK}>
                <td className="rank">
                  <span className="sr-only">Rank </span>
                  {item.RANK}
                </td>
                <td className="team">
                  <span>{item.COLLEGE}</span>
                </td>
                <td>
                  <span className="sr-only">Record: </span>
                  {item.RECORD}
                </td>
                <td>
                  <span className="sr-only">Points: </span>
                  {item.POINTS}
                </td>
                <td>
                  <span className="sr-only">Previous Rank: </span>
                  {item["PREVIOUS RANK"]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="update-info" role="note" aria-label="Data source information">
          <p>Source: {rankings.title}</p>
          <p>Last Updated: {rankings.updated}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamRankings;