import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';

const StatsScreen = ({ statData, activeCategory, onCategoryChange }) => {
  const categories = [
    // Batting Categories
    { id: 'batting', label: 'Batting Average', group: 'batting' },
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
      console.log('StatsScreen: Changing category to', categoryId);
      onCategoryChange(categoryId);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = 
    !statData || 
    statData.isLoading || 
    !Array.isArray(statData.leaders) || 
    statData.leaders.length === 0;
  
  // Filter categories by group to display them in separate sections
  const battingCategories = categories.filter(cat => cat.group === 'batting');
  const pitchingCategories = categories.filter(cat => cat.group === 'pitching');

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

  // Get the column label based on category
  const getColumnLabel = () => {
    switch(activeCategory) {
      case 'batting': return 'AVG';
      case 'hits': return 'H';
      case 'homeRuns': return 'HR';
      case 'obp': return 'OB%';
      case 'slg': return 'SLG%';
      case 'era': return 'ERA';
      case 'strikeoutsTotal': return 'SO';
      case 'strikeoutsPerSeven': return 'K/7';
      default: return 'Value';
    }
  };

  // Render a stat leader item
  const renderStatItem = ({ item }) => {
    const additionalStats = item.additionalStats || {};
    
    let additionalColumns = null;
    
    switch(activeCategory) {
      case 'batting':
        additionalColumns = (
          <>
            <Text style={styles.cellSmall}>{additionalStats.g || '-'}</Text>
            <Text style={styles.cellSmall}>{additionalStats.ab || '-'}</Text>
            <Text style={styles.cellSmall}>{additionalStats.h || '-'}</Text>
          </>
        );
        break;
      case 'hits':
        additionalColumns = (
          <Text style={styles.cellSmall}>{additionalStats.g || '-'}</Text>
        );
        break;
      case 'homeRuns':
        additionalColumns = (
          <>
            <Text style={styles.cellSmall}>{additionalStats.g || '-'}</Text>
            <Text style={styles.cellSmall}>{additionalStats.hr_g ? additionalStats.hr_g.toFixed(2) : '-'}</Text>
          </>
        );
        break;
      // Add other cases as needed
      default:
        additionalColumns = null;
    }
    
    return (
      <View style={styles.tableRow}>
        <Text style={[styles.cell, styles.rankCell]}>{item.rank}</Text>
        <View style={styles.playerInfoCell}>
          <Text style={styles.playerName}>{item.player.name}</Text>
          <Text style={styles.teamName}>{item.team.name}</Text>
          <Text style={styles.playerDetails}>{item.player.classYear || '-'} | {item.player.position || '-'}</Text>
        </View>
        <View style={styles.statsContainer}>
          {additionalColumns}
          <Text style={[styles.cell, styles.valueCell]}>{formatValue(item.value, activeCategory)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Statistical Leaders</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
      >
        <View style={styles.categorySections}>
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Batting</Text>
            <View style={styles.categoryTabs}>
              {battingCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    activeCategory === category.id && styles.activeTab
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                >
                  <Text 
                    style={[
                      styles.categoryTabText,
                      activeCategory === category.id && styles.activeTabText
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Pitching</Text>
            <View style={styles.categoryTabs}>
              {pitchingCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    activeCategory === category.id && styles.activeTab
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                >
                  <Text 
                    style={[
                      styles.categoryTabText,
                      activeCategory === category.id && styles.activeTabText
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading statistical leaders...</Text>
        </View>
      ) : (
        <View style={styles.statsListContainer}>
          <Text style={styles.categoryTitle}>{statData.category}</Text>
          
          <FlatList
            data={statData.leaders}
            renderItem={renderStatItem}
            keyExtractor={(item) => `${item.rank}-${item.player.name}-${item.team.name}`}
            style={styles.statsList}
          />
          
          <View style={styles.updateInfo}>
            <Text style={styles.updateInfoText}>Data Source: NCAA.com</Text>
            <Text style={styles.updateInfoText}>Last Updated: {statData.updated || new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  categoryScroll: {
    maxHeight: 150,
    paddingHorizontal: 10,
  },
  categorySections: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  categorySection: {
    marginRight: 20,
    minWidth: 300,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTab: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    margin: 3,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#0066CC',
  },
  categoryTabText: {
    fontSize: 12,
    color: '#444',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '500',
  },
  statsListContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    alignItems: 'center',
  },
  cell: {
    fontSize: 14,
  },
  cellSmall: {
    fontSize: 12,
    paddingHorizontal: 5,
    textAlign: 'center',
    color: '#666',
  },
  rankCell: {
    width: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playerInfoCell: {
    flex: 1,
    paddingHorizontal: 10,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  teamName: {
    fontSize: 12,
    color: '#444',
  },
  playerDetails: {
    fontSize: 10,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueCell: {
    width: 50,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  updateInfo: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  updateInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  }
});

export default StatsScreen;