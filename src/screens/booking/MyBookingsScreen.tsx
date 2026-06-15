import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMyBookings } from '../../hooks/useBookings';
import { BookingStackParamList } from '../../navigation/types';
import { Booking } from '../../types/booking';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList>>();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');

  const { data, isLoading, isError, error, refetch, isFetching } = useMyBookings();

  const bookings = data?.bookings || [];

  const filteredBookings = bookings.filter((b) => {
    const isUpcoming = b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
    return activeTab === 'UPCOMING' ? isUpcoming : !isUpcoming;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return styles.statusConfirmed;
      case 'PENDING':
        return styles.statusPending;
      case 'CANCELLED':
      case 'REJECTED':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.vehicleTitle}>
          {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : 'Vehicle Listing'}
        </Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Start Date</Text>
          <Text style={styles.detailValue}>
            {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>End Date</Text>
          <Text style={styles.detailValue}>
            {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Total Amount</Text>
          <Text style={styles.detailValue}>${item.totalAmount}</Text>
        </View>
      </View>

      {item.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() =>
            navigation.navigate('PaymentScreen', {
              bookingId: item.id,
              amount: item.totalAmount,
            })
          }
        >
          <Text style={styles.payButtonText}>Pay Now via Razorpay</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Track and manage your rental reservations</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'UPCOMING' && styles.tabActive]}
          onPress={() => setActiveTab('UPCOMING')}
        >
          <Text style={[styles.tabText, activeTab === 'UPCOMING' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'PAST' && styles.tabActive]}
          onPress={() => setActiveTab('PAST')}
        >
          <Text style={[styles.tabText, activeTab === 'PAST' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => String(item)}
          renderItem={() => <SkeletonLoader />}
          contentContainerStyle={styles.listContainer}
        />
      ) : isError ? (
        <ErrorState onRetry={refetch} message={error?.message} />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor="#8b5cf6"
              colors={['#8b5cf6']}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No bookings found"
              message="You don't have any bookings listed under this category tab."
              icon="📅"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f16',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20,
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#161622',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#1e1e2f',
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusConfirmed: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
    color: '#cbd5e1', // Badges contain text color locally
  },
  statusPending: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: '#eab308',
    color: '#cbd5e1',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    color: '#cbd5e1',
  },
  statusDefault: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: '#64748b',
    color: '#cbd5e1',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    marginTop: 4,
  },
  payButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f0f16',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  errorSub: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default MyBookingsScreen;
