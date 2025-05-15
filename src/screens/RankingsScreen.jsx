import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';

const RankingsScreen = ({ rankings }) => {
  // Early return if no data is available
  if (!rankings || !rankings.data || rankings.data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading rankings...</Text>
      </View>
    );
  }

  // Render a row in the rankings table
  const renderRankingItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.rankCell]}>{item.RANK}</Text>
      <Text style={[styles.tableCell, styles.teamCell]}>{item.COLLEGE}</Text>
      <Text style={[styles.tableCell, styles.recordCell]}>{item.RECORD}</Text>
      <Text style={[styles.tableCell, styles.pointsCell]}>{item.POINTS}</Text>
      <Text style={[styles.tableCell, styles.prevRankCell]}>{item["PREVIOUS RANK"]}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCell]}>Rank</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
        <Text style={[styles.headerCell, styles.recordCell]}>Record</Text>
        <Text style={[styles.headerCell, styles.pointsCell]}>Points</Text>
        <Text style={[styles.headerCell, styles.prevRankCell]}>Prev</Text>
      </View>
      
      <FlatList
        data={rankings.data}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.RANK.toString()}
        style={styles.list}
      />
      
      <View style={styles.updateInfo}>
        <Text style={styles.updateInfoText}>Source: {rankings.title || 'NCAA'}</Text>
        <Text style={styles.updateInfoText}>Last Updated: {rankings.updated || new Date().toLocaleDateString()}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  tableCell: {
    fontSize: 14,
  },
  rankCell: {
    width: '10%',
    textAlign: 'center',
  },
  teamCell: {
    width: '40%',
    fontWeight: '500',
  },
  recordCell: {
    width: '20%',
    textAlign: 'center',
  },
  pointsCell: {
    width: '15%',
    textAlign: 'center',
  },
  prevRankCell: {
    width: '15%',
    textAlign: 'center',
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

export default RankingsScreen;