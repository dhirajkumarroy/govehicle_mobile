import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/types';

type PaymentScreenRouteProp = RouteProp<BookingStackParamList, 'PaymentScreen'>;

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { bookingId, amount } = route.params;

  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = (success: boolean) => {
    setLoading(true);

    // Simulate cryptographic verification callback / webhook checks delay
    setTimeout(() => {
      setLoading(false);
      if (success) {
        Alert.alert(
          'Payment Successful',
          'Your transaction was successfully verified. Booking confirmed!',
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                // Return to bookings history tab
                navigation.navigate('BookingTab', { screen: 'MyBookings' });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Payment Failed',
          'Razorpay payment checkout failed. Please verify credentials or try again.',
          [{ text: 'Retry Checkout' }]
        );
      }
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Secure Checkout</Text>
          <Text style={styles.subtitle}>Razorpay Integrated Payment gateway</Text>
        </View>

        <View style={styles.gatewayCard}>
          <View style={styles.brandContainer}>
            <Text style={styles.razorText}>razor<Text style={styles.payAccent}>pay</Text></Text>
            <View style={styles.secureBadge}>
              <Text style={styles.secureText}>100% SECURE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking Reference</Text>
            <Text style={styles.infoValue}>{bookingId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payable Amount</Text>
            <Text style={styles.amountText}>${amount}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Verifying transaction signature...</Text>
          </View>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => handleSimulatePayment(true)}
            >
              <Text style={styles.successButtonText}>Simulate Payment Success</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.failButton}
              onPress={() => handleSimulatePayment(false)}
            >
              <Text style={styles.failButtonText}>Simulate Payment Failure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  gatewayCard: {
    backgroundColor: '#161622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 24,
    marginVertical: 40,
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  razorText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  payAccent: {
    color: '#008cff', // Razorpay blue
  },
  secureBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  secureText: {
    color: '#22c55e',
    fontSize: 9,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#2d2d44',
    marginBottom: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '600',
    marginTop: 4,
  },
  amountText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '800',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 16,
  },
  actions: {
    width: '100%',
  },
  successButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  failButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  failButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default PaymentScreen;
