import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const OwnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Host Dashboard</Text>
          <Text style={styles.subtitle}>Overview of earnings, listing performance, and requests</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statValue}>$4,820</Text>
            <Text style={styles.statTrend}>+12% this month</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Listings</Text>
            <Text style={styles.statValue}>3 Vehicles</Text>
            <Text style={styles.statTrend}>2 rented today</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Bookings</Text>
            <Text style={styles.statValue}>46 Bookings</Text>
            <Text style={styles.statTrend}>98% satisfaction</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={styles.statValue}>2 Requests</Text>
            <Text style={styles.statTrend}>Requires confirmation</Text>
          </View>
        </View>

        {/* Operations list */}
        <Text style={styles.sectionTitle}>Host Actions</Text>
        <View style={styles.actionCard}>
          <TouchableOpacity style={styles.actionRow}>
            <View>
              <Text style={styles.actionName}>Add New Vehicle Listing</Text>
              <Text style={styles.actionDesc}>Upload photos, set pricing rates and availability dates</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <View>
              <Text style={styles.actionName}>Manage Active Rentals</Text>
              <Text style={styles.actionDesc}>Confirm checkouts, coordinate locations and key handoffs</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <View>
              <Text style={styles.actionName}>View Earnings History</Text>
              <Text style={styles.actionDesc}>Download invoice summaries and payout details</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f16',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
  },
  statTrend: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#161622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#8b5cf6',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#2d2d44',
    marginVertical: 4,
  },
});

export default OwnerDashboardScreen;
