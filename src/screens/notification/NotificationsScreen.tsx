import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

interface NotificationMock {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED' | 'SYSTEM';
  isRead: boolean;
  time: string;
}

const MOCK_NOTIFICATIONS: NotificationMock[] = [
  {
    id: 'n1',
    title: 'Booking Confirmed',
    message: 'Your booking request for Tesla Model S has been confirmed by the owner.',
    type: 'BOOKING_CONFIRMED',
    isRead: false,
    time: '2 hours ago',
  },
  {
    id: 'n2',
    title: 'New Booking Request',
    message: 'You received a new booking request for your Ford Mustang.',
    type: 'BOOKING_REQUEST',
    isRead: false,
    time: '1 day ago',
  },
  {
    id: 'n3',
    title: 'System Update',
    message: 'Scheduled server maintenance completed. Payment systems are fully operational.',
    type: 'SYSTEM',
    isRead: true,
    time: '3 days ago',
  },
];

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const getIndicatorColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return '#22c55e'; // green
      case 'BOOKING_REQUEST':
        return '#8b5cf6'; // violet
      case 'BOOKING_REJECTED':
      case 'BOOKING_CANCELLED':
        return '#ef4444'; // red
      default:
        return '#64748b'; // slate
    }
  };

  const renderItem = ({ item }: { item: NotificationMock }) => (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.cardUnread]}
      onPress={() => toggleRead(item.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={[styles.indicator, { backgroundColor: getIndicatorColor(item.type) }]} />
          <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}>{item.title}</Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <Text style={styles.messageText}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Stay updated on booking requests and cancellations</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no notifications.</Text>
          </View>
        }
      />
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  markReadText: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: 13,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
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
    marginBottom: 14,
  },
  cardUnread: {
    borderColor: '#2d2d44',
    backgroundColor: '#1b1b2a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  cardTitleUnread: {
    color: '#ffffff',
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  messageText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    fontWeight: '500',
    paddingLeft: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationsScreen;
