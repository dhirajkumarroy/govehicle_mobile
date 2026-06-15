import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useDashboardStats,
  useOwnerBookings,
  useApproveBooking,
  useRejectBooking,
} from '../../hooks/useOwner';
import { Booking } from '../../types/booking';

export const OwnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Fetch live stats & bookings
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings, isRefetching } = useOwnerBookings({ limit: 20 });

  const approveMutation = useApproveBooking();
  const rejectMutation = useRejectBooking();

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchBookings()]);
  };

  const handleApprove = (bookingId: string) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            approveMutation.mutate(bookingId, {
              onSuccess: () => {
                Alert.alert('Success', 'Booking request has been approved successfully.');
                refetchStats();
              },
              onError: (err: any) => {
                Alert.alert('Failed', err.message || 'Could not approve booking.');
              },
            });
          },
        },
      ]
    );
  };

  const handleReject = (bookingId: string) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectMutation.mutate(bookingId, {
              onSuccess: () => {
                Alert.alert('Success', 'Booking request has been rejected.');
                refetchStats();
              },
              onError: (err: any) => {
                Alert.alert('Failed', err.message || 'Could not reject booking.');
              },
            });
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return '#10b981'; // Green
      case 'PENDING':
        return '#8b5cf6'; // Violet
      case 'CANCELLED':
      case 'REJECTED':
        return '#f43f5e'; // Red
      default:
        return '#64748b'; // Gray
    }
  };

  const renderBookingRequest = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.vehicleCol}>
          <Text style={styles.vehicleName}>{booking.vehicle?.brand} {booking.vehicle?.title}</Text>
          <Text style={styles.customerName}>Renter: {booking.customer?.name || 'Customer'}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: getStatusColor(booking.status) }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(booking.status) }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bookingDetails}>
        <Text style={styles.detailText}>
          📅 {booking.startDate.split('T')[0]} to {booking.endDate.split('T')[0]}
        </Text>
        <Text style={styles.detailText}>
          ⏱️ {booking.totalDays} Days rental
        </Text>
        <Text style={styles.amountText}>
          Total Amount: <Text style={styles.amountVal}>${booking.totalAmount}</Text>
        </Text>
      </View>

      {booking.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(booking.id)}
            disabled={rejectMutation.isPending || approveMutation.isPending}
          >
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(booking.id)}
            disabled={rejectMutation.isPending || approveMutation.isPending}
          >
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const bookingsList = bookingsData?.bookings || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#8b5cf6"
            colors={['#8b5cf6']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Host Dashboard</Text>
          <Text style={styles.subtitle}>Overview of earnings, listing performance, and requests</Text>
        </View>

        {/* Stats Grid */}
        {statsLoading ? (
          <View style={styles.statsLoadingBox}>
            <ActivityIndicator color="#8b5cf6" size="small" />
            <Text style={styles.statsLoadingText}>Calculating stats...</Text>
          </View>
        ) : statsError ? (
          <View style={styles.statsLoadingBox}>
            <Text style={styles.statsErrorText}>Failed to load statistics.</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>${stats?.revenue}</Text>
              <Text style={styles.statSubText}>Confirmed rentals</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Vehicles</Text>
              <Text style={styles.statValue}>{stats?.totalVehicles}</Text>
              <Text style={styles.statSubText}>{stats?.activeVehicles} Active Listings</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Bookings</Text>
              <Text style={styles.statValue}>{stats?.totalBookings}</Text>
              <Text style={styles.statSubText}>All-time requests</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Pending Requests</Text>
              <Text style={[styles.statValue, (stats?.pendingRequests || 0) > 0 && styles.purpleText]}>
                {stats?.pendingRequests}
              </Text>
              <Text style={styles.statSubText}>Requires attention</Text>
            </View>
          </View>
        )}

        {/* Host Operations links */}
        <Text style={styles.sectionTitle}>Manage Listings</Text>
        <View style={styles.actionCard}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('MyVehicles')}>
            <View>
              <Text style={styles.actionName}>My Registered Vehicles</Text>
              <Text style={styles.actionDesc}>View, edit details, or delete registered listings</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('CreateVehicle')}>
            <View>
              <Text style={styles.actionName}>Add New Vehicle Listing</Text>
              <Text style={styles.actionDesc}>Upload photos and specify vehicle parameters</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Incoming requests */}
        <Text style={styles.sectionTitle}>Booking Requests</Text>
        {bookingsLoading ? (
          <ActivityIndicator color="#8b5cf6" style={{ marginVertical: 20 }} />
        ) : bookingsList.length === 0 ? (
          <View style={styles.emptyRequests}>
            <Text style={styles.emptyText}>No booking requests received yet.</Text>
          </View>
        ) : (
          <View>{bookingsList.map(renderBookingRequest)}</View>
        )}
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
    paddingBottom: 45,
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
    marginBottom: 24,
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
  statSubText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 6,
  },
  statsLoadingBox: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161622',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    marginBottom: 24,
  },
  statsLoadingText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  statsErrorText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '600',
  },
  purpleText: {
    color: '#a78bfa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#161622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 20,
    marginBottom: 24,
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
  actionDivider: {
    height: 1,
    backgroundColor: '#1e1e2f',
    marginVertical: 4,
  },
  bookingCard: {
    backgroundColor: '#161622',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleCol: {
    flex: 1,
    marginRight: 12,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  customerName: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e1e2f',
    marginVertical: 12,
  },
  bookingDetails: {
    marginBottom: 14,
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  amountText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
    marginTop: 4,
  },
  amountVal: {
    color: '#a78bfa',
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  rejectBtn: {
    borderColor: '#f43f5e',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  rejectBtnText: {
    color: '#f43f5e',
    fontSize: 13,
    fontWeight: '700',
  },
  approveBtn: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyRequests: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OwnerDashboardScreen;
