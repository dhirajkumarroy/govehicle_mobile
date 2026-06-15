import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useCreateBooking } from '../../hooks/useBookings';
import { BookingStackParamList } from '../../navigation/types';

type BookingScreenRouteProp = RouteProp<BookingStackParamList, 'BookingScreen'>;

export const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<BookingScreenRouteProp>();
  const { vehicleId, pricePerDay, title } = route.params;

  const [startDate, setStartDate] = useState('2026-07-20');
  const [endDate, setEndDate] = useState('2026-07-25');
  const [notes, setNotes] = useState('');
  const [totalDays, setTotalDays] = useState(5);
  const [totalAmount, setTotalAmount] = useState(0);

  const createBookingMutation = useCreateBooking();

  useEffect(() => {
    // Dynamic duration calculator
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (days > 0) {
          setTotalDays(days);
          setTotalAmount(days * pricePerDay);
        } else {
          setTotalDays(0);
          setTotalAmount(0);
        }
      }
    } catch (error) {
      setTotalDays(0);
      setTotalAmount(0);
    }
  }, [startDate, endDate, pricePerDay]);

  const handleConfirmBooking = () => {
    if (totalDays <= 0) {
      Alert.alert('Validation Error', 'Booking duration must be at least 1 day.');
      return;
    }

    createBookingMutation.mutate({
      vehicleId,
      startDate,
      endDate,
      notes: notes || undefined,
    }, {
      onSuccess: (newBooking) => {
        Alert.alert(
          'Booking Created',
          'Your booking request has been successfully submitted. Proceeding to checkout.',
          [
            {
              text: 'Go to Pay',
              onPress: () => {
                // Navigate to PaymentScreen
                navigation.navigate('PaymentScreen', {
                  bookingId: newBooking.id,
                  amount: newBooking.totalAmount,
                });
              },
            },
          ]
        );
      },
      onError: (error: any) => {
        Alert.alert('Booking Failed', error?.message || 'Date conflicts or validation error occurred.');
      }
    });
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
          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
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

        {createBookingMutation.isError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {(createBookingMutation.error as any)?.message || 'Validation error occurred.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={createBookingMutation.isPending}
        >
          {createBookingMutation.isPending ? (
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
    marginBottom: 20,
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
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
