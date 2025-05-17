import { useState, useEffect } from 'react'
import PullToRefresh from 'react-pull-to-refresh';
import './App.css'
import { fetchTeamRankings, fetchStatLeaders } from './services/softballAPI';
import TeamRankings from './components/TeamRankings';
import StatLeaders from './components/StatLeaders';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  const [rankings, setRankings] = useState(null);
  const [statData, setStatData] = useState(null);
  const [activeStatCategory, setActiveStatCategory] = useState('batting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('rankings'); // Default to rankings tab
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  
  // Check if device is mobile and if running in Capacitor
  useEffect(() => {
    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check if running in Capacitor (iOS/Android app)
    const checkIfCapacitor = () => {
      const isCapacitorApp = !!window.Capacitor || window.location.protocol === 'capacitor:';
      setIsCapacitor(isCapacitorApp);
      console.log('Running in Capacitor:', isCapacitorApp);
    };
    
    // Initial checks
    checkIfMobile();
    checkIfCapacitor();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');

        // Fetch rankings
        try {
          const rankingsData = await fetchTeamRankings();
          console.log('Rankings data received');
          setRankings(rankingsData);
        } catch (rankingsError) {
          console.error('Error fetching rankings:', rankingsError);
          setError('Failed to load rankings. Please try again later.');
        }

        // Fetch initial stats data
        try {
          const initialStatData = await fetchStatLeaders(activeStatCategory);
          console.log('Stats data received');
          setStatData(initialStatData);
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          setError('Failed to load statistics. Please try again later.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in main data fetch:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle refreshing data
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Refresh rankings
      try {
        const rankingsData = await fetchTeamRankings();
        setRankings(rankingsData);
      } catch (rankingsError) {
        console.error('Error refreshing rankings:', rankingsError);
      }

      // Refresh stats data
      try {
        const refreshedStatData = await fetchStatLeaders(activeStatCategory);
        setStatData(refreshedStatData);
      } catch (statsError) {
        console.error('Error refreshing stats:', statsError);
      }
      
      // Success message (could show a toast notification here)
      console.log('Data refreshed successfully');
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
    
    // Return promise for PTR component
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  // Handle stat category change
  const handleCategoryChange = async (category) => {
    console.log('Changing category to:', category);
    setActiveStatCategory(category);
    
    try {
      // Show loading state for this category
      setStatData(prev => ({ 
        ...prev, 
        isLoading: true,
        category: getCategoryTitle(category) 
      }));
      
      const newStatData = await fetchStatLeaders(category);
      console.log(`New stat data received for ${category}`);
      
      setStatData({
        ...newStatData,
        isLoading: false
      });
    } catch (err) {
      console.error(`Error fetching ${category} stats:`, err);
      setStatData(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load ${getCategoryTitle(category)}. Please try again later.`
      }));
    }
  };
  
  // Helper function to get category title
  const getCategoryTitle = (category) => {
    const titles = {
      'batting': 'Batting Average',
      'hits': 'Hits',
      'homeRuns': 'Home Runs',
      'obp': 'On-Base Percentage',
      'slg': 'Slugging Percentage',
      'era': 'Earned Run Average',
      'strikeoutsPerSeven': 'Strikeouts Per Seven Innings',
      'strikeoutsTotal': 'Strikeouts'
    };
    return titles[category] || 'Statistical Leaders';
  };

  // Safely render the app even if some components might have issues
  const renderContent = () => {
    try {
      // Create page content with modern header
      const content = (
        <div className="app-container">
          <div className={`modern-header ${isCapacitor ? 'ios-padding' : ''}`}>
            <h1>NCAA D1 College Softball Stats & Rankings</h1>
            <p className="data-update-info">
              Data updated: {new Date().toLocaleDateString()}
              {refreshing && ' (Refreshing...)'}
            </p>
          </div>

          <nav className="app-navigation">
            <ul>
              <li className={activeTab === 'rankings' ? 'active' : ''}>
                <button onClick={() => setActiveTab('rankings')}>Rankings</button>
              </li>
              <li className={activeTab === 'stats' ? 'active' : ''}>
                <button onClick={() => setActiveTab('stats')}>Stat Leaders</button>
              </li>
            </ul>
          </nav>

          <main className="app-content">
            {activeTab === 'rankings' && (
              <div className="section-container rankings-section">
                {/* Only apply PullToRefresh to the table container itself, not the entire page */}
                {isMobile ? (
                  <PullToRefresh 
                    onRefresh={handleRefresh}
                    pullingContent={<div className="refreshing-indicator">Pull down to refresh rankings...</div>}
                    refreshingContent={<div className="refreshing-indicator">Refreshing NCAA rankings data...</div>}
                    className="rankings-ptr-container"
                  >
                    <TeamRankings rankings={rankings || { data: [] }} />
                  </PullToRefresh>
                ) : (
                  <TeamRankings rankings={rankings || { data: [] }} />
                )}
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="section-container">
                <StatLeaders 
                  statData={statData || { category: 'Batting Average', leaders: [] }} 
                  activeCategory={activeStatCategory}
                  onCategoryChange={handleCategoryChange} 
                />
              </div>
            )}
          </main>

          <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} NCAA D1 College Softball Stats & Rankings | Data Sources: NCAA </p>
          </footer>
        </div>
      );
      
      return content;
    } catch (renderError) {
      console.error('Render error:', renderError);
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading NCAA D1 College Softball data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <>
      {renderContent()}
      <PWAInstallPrompt />
    </>
  );
}

export default App;
