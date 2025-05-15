import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { fetchTeamRankings, fetchStatLeaders } from './services/softballAPI';

// Import our screens (we'll create these next)
import RankingsScreen from './screens/RankingsScreen';
import StatsScreen from './screens/StatsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [rankings, setRankings] = useState(null);
  const [statData, setStatData] = useState(null);
  const [activeStatCategory, setActiveStatCategory] = useState('batting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading NCAA D1 College Softball data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.headerContainer}>
        <Text style={styles.headerTitle}>NCAA D1 College Softball</Text>
        <Text style={styles.headerSubtitle}>
          Data updated: {new Date().toLocaleDateString()}
        </Text>
      </SafeAreaView>
      
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0066CC',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Rankings" 
          options={{
            tabBarLabel: 'Rankings',
            tabBarIcon: ({ color, size }) => (
              <Text style={{color, fontSize: size-4}}>📊</Text>
            ),
          }}
        >
          {() => <RankingsScreen rankings={rankings || { data: [] }} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Stats" 
          options={{
            tabBarLabel: 'Stat Leaders',
            tabBarIcon: ({ color, size }) => (
              <Text style={{color, fontSize: size-4}}>📈</Text>
            ),
          }}
        >
          {() => (
            <StatsScreen 
              statData={statData || { category: 'Batting Average', leaders: [] }} 
              activeCategory={activeStatCategory}
              onCategoryChange={handleCategoryChange} 
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
      
      <SafeAreaView style={styles.footerContainer}>
        <Text style={styles.footerText}>
          &copy; {new Date().getFullYear()} NCAA D1 College Softball | Data Sources: NCAA
        </Text>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#0066CC',
    padding: 15,
    paddingTop: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0e0e0',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  footerContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});