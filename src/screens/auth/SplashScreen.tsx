import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../../store';
import { loadStoredToken } from '../../store/slices/authSlice';

export const SplashScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadStoredToken());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Go<Text style={styles.logoAccent}>Vehicle</Text></Text>
        <Text style={styles.subtitle}>Premium Vehicle Booking Marketplace</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Restoring session...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  logoAccent: {
    color: '#8b5cf6',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default SplashScreen;
