import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { HomeStackParamList } from '../../navigation/types';

export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user, loading } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.intro}>Find your perfect ride or manage your listings today.</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Your Account</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user?.phone || 'Not Provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user?.role}</Text>
            </View>
          </View>

          {/* Quick link to Owner Dashboard if host */}
          {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={() => navigation.navigate('OwnerDashboard')}
            >
              <Text style={styles.dashboardButtonText}>Open Host Console</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f16',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '500',
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  intro: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 20,
    padding: 24,
    flex: 1,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
    paddingBottom: 12,
  },
  infoRow: {
    marginBottom: 18,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  badgeText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
  },
  dashboardButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  dashboardButtonText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;
