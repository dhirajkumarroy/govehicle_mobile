import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/types';

type BookingScreenRouteProp = RouteProp<BookingStackParamList, 'BookingScreen'>;

export const BookingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList>>();
  const route = useRoute<BookingScreenRouteProp>();
  const { vehicleId, pricePerDay, title } = route.params;

  const [startDate, setStartDate] = useState('2026-07-20');
  const [endDate, setEndDate] = useState('2026-07-25');
  const [notes, setNotes] = useState('');
  const [totalDays, setTotalDays] = useState(5);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Basic day calculator simulator
    setTotalAmount(totalDays * pricePerDay);
  }, [totalDays, pricePerDay]);

  const handleConfirmBooking = () => {
    setLoading(true);
    // Simulate booking creation API dispatch
    setTimeout(() => {
      setLoading(false);
      // Navigate to payment screen passing mock generated booking ID
      navigation.navigate('PaymentScreen', {
        bookingId: `mock_b_${Math.floor(Math.random() * 10000)}`,
        amount: totalAmount,
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Change Vehicle</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Reservation</Text>
          <Text style={styles.subtitle}>Review rental dates and calculate totals</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.vehicleTitle}>{title}</Text>
          <Text style={styles.priceLabel}>${pricePerDay} / day rate</Text>

          <View style={styles.divider} />

          {/* Dates selectors */}
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={(text) => {
              setStartDate(text);
              // Simple simulation update
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={(text) => {
              setEndDate(text);
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Special Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="E.g. Requesting early pickup, child seat..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Pricing breakdown */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceDesc}>Rental fee ({totalDays} days)</Text>
            <Text style={styles.priceVal}>${totalAmount}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceDesc}>Insurance & Taxes</Text>
            <Text style={styles.priceVal}>$0.00 (Free)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalDesc}>Total Amount</Text>
            <Text style={styles.totalVal}>${totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Go to Payment</Text>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 16,
    marginBottom: 20,
  },
  backLink: {
    marginBottom: 12,
  },
  backLinkText: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: 13,
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
  card: {
    backgroundColor: '#161622',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 20,
    marginBottom: 20,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  priceLabel: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e1e2f',
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pricingCard: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 16,
    padding: 20,
  },
  pricingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceDesc: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  priceVal: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  totalDesc: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  totalVal: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161622',
    borderTopWidth: 1,
    borderTopColor: '#1e1e2f',
    padding: 20,
  },
  confirmButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookingScreen;
