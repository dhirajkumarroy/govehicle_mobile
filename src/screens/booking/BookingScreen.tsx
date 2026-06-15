import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useCreateBooking } from '../../hooks/useBookings';
import { BookingStackParamList } from '../../navigation/types';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

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
          <AppButton
            title="← Change Vehicle"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Confirm Reservation</Text>
          <Text style={styles.subtitle}>Review rental dates and calculate totals</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.vehicleTitle}>{title}</Text>
          <Text style={styles.priceLabel}>${pricePerDay} / day rate</Text>

          <View style={styles.divider} />

          {/* Dates selectors */}
          <AppInput
            label="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />

          <AppInput
            label="End Date (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
          />

          <AppInput
            label="Special Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="E.g. Requesting early pickup, child seat..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
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
        <AppButton
          title="Confirm & Go to Payment"
          onPress={handleConfirmBooking}
          loading={createBookingMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadiusSm,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.extraBold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    fontWeight: typography.weights.medium,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  vehicleTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  priceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primaryLight,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusXl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  pricingTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priceDesc: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  priceVal: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  totalDesc: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  totalVal: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.xl,
  },
});

export default BookingScreen;
