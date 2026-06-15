import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BookingStackParamList } from '../../navigation/types';
import { useBooking } from '../../hooks/useBookings';
import { useCreateOrder, useVerifyPayment, useMyPayments } from '../../hooks/usePayments';
import { useAppSelector } from '../../store';
import Config from '../../config';
import RazorpayCheckout from 'react-native-razorpay';
import AppButton from '../../components/AppButton';
import AppLoader from '../../components/AppLoader';
import ErrorState from '../../components/ErrorState';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

type PaymentScreenRouteProp = RouteProp<BookingStackParamList, 'PaymentScreen'>;

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { bookingId } = route.params;

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Redux auth user (for pre-filling checkout details)
  const user = useAppSelector((state) => state.auth.user);

  // Fetch current booking details
  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
    error: bookingErr,
    refetch: refetchBooking,
  } = useBooking(bookingId);

  // Fetch payments to resolve exact status (PENDING, SUCCESS, FAILED, REFUNDED)
  const {
    data: myPaymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useMyPayments({ limit: 100 });

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

  // Find the specific payment for this booking, if it exists
  const activePayment = myPaymentsData?.payments?.find(
    (p) => p.bookingId === bookingId
  );

  // Resolve current active status
  const getStatusDisplay = () => {
    // If the booking is already confirmed, treat as Success
    if (booking?.status === 'CONFIRMED' || booking?.status === 'COMPLETED' || booking?.status === 'ACCEPTED') {
      return {
        label: 'SUCCESS',
        color: colors.success,
        description: 'Payment verified and booking confirmed.',
      };
    }
    if (booking?.status === 'CANCELLED') {
      return {
        label: 'CANCELLED',
        color: colors.error,
        description: 'Booking reservation has been cancelled.',
      };
    }
    if (booking?.status === 'REJECTED') {
      return {
        label: 'REJECTED',
        color: colors.error,
        description: 'Booking reservation has been rejected by owner.',
      };
    }

    if (activePayment) {
      switch (activePayment.status) {
        case 'SUCCESS':
          return {
            label: 'SUCCESS',
            color: colors.success,
            description: 'Payment verified and booking confirmed.',
          };
        case 'FAILED':
          return {
            label: 'FAILED',
            color: colors.error,
            description: 'Previous transaction failed. Please retry.',
          };
        case 'REFUNDED':
          return {
            label: 'REFUNDED',
            color: colors.textMuted,
            description: 'Payment was refunded.',
          };
        case 'PENDING':
        default:
          return {
            label: 'PENDING',
            color: colors.primary,
            description: 'Awaiting checkout authorization.',
          };
      }
    }

    return {
      label: 'PENDING',
      color: colors.primary,
      description: 'Awaiting checkout authorization.',
    };
  };

  const statusInfo = getStatusDisplay();

  // Helper function to resolve dynamic image endpoints
  const getFullImageUrl = (imagePath?: string): string => {
    const fallbackImage = 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop';
    if (!imagePath) return fallbackImage;
    if (imagePath.startsWith('http')) return imagePath;

    const baseUrl = Config.API_URL.split('/api/v1')[0];
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  // Launch checkout
  const handlePayNow = async () => {
    if (!booking) return;

    setCheckoutLoading(true);

    try {
      // 1. Create order on backend
      const orderData = await createOrderMutation.mutateAsync(bookingId);
      const { razorpayOrder } = orderData;

      // 2. Prepare checkout options
      const options = {
        description: `Rental payment for booking reference ${booking.id.slice(0, 8)}`,
        image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=120&auto=format&fit=crop',
        currency: razorpayOrder.currency || 'INR',
        key: Config.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount, // in paise
        name: 'GoVehicle Rentals',
        order_id: razorpayOrder.id,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.name || '',
        },
        theme: {
          color: colors.primary,
        },
      };

      // 3. Open Razorpay checkout screen
      try {
        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
          throw new Error('Razorpay SDK native module not loaded.');
        }

        const data = await RazorpayCheckout.open(options);

        // 4. Send verification payload to backend on checkout success
        await verifyPaymentMutation.mutateAsync({
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpaySignature: data.razorpay_signature,
        });

        // Refresh lists and display success
        refetchBooking();
        refetchPayments();
        setCheckoutLoading(false);

        Alert.alert(
          'Payment Successful',
          'Your signature has been cryptographically verified and booking is now CONFIRMED.',
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                navigation.navigate('BookingTab', { screen: 'MyBookings' });
              },
            },
          ]
        );
      } catch (sdkError: any) {
        setCheckoutLoading(false);

        // Fallback check if the native module is not available in non-custom Expo Go client
        if (sdkError.message?.includes('native module') || !RazorpayCheckout) {
          Alert.alert(
            'SDK Not Available',
            'Razorpay native module is not linked in this environment (standard Expo Go). Do you want to simulate a successful payment verification?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Simulate Verification',
                onPress: () => handleSimulatedPaymentSuccess(razorpayOrder.id),
              },
            ]
          );
        } else {
          Alert.alert(
            'Payment Cancelled',
            sdkError.description || 'The transaction was cancelled by the user.',
            [{ text: 'Dismiss' }]
          );
        }
      }
    } catch (orderError: any) {
      setCheckoutLoading(false);
      Alert.alert(
        'Order Creation Failed',
        orderError.message || 'Could not register order with the server.'
      );
    }
  };

  const handleSimulatedPaymentSuccess = async (razorpayOrderId: string) => {
    setCheckoutLoading(true);
    try {
      await verifyPaymentMutation.mutateAsync({
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
        razorpaySignature: 'mock_signature_from_expo_go_simulation',
      });

      refetchBooking();
      refetchPayments();
      setCheckoutLoading(false);

      Alert.alert(
        'Signature Verification Sent',
        'Verification request has been submitted. Check details.',
        [
          {
            text: 'Okay',
            onPress: () => {
              navigation.navigate('BookingTab', { screen: 'MyBookings' });
            },
          },
        ]
      );
    } catch (error: any) {
      setCheckoutLoading(false);
      Alert.alert(
        'Verification Response',
        error.message || 'Backend rejected the simulated signature. For real payments, run on a Custom Dev Client.'
      );
    }
  };

  if (bookingLoading || paymentsLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <AppLoader message="Fetching checkout records..." />
      </SafeAreaView>
    );
  }

  if (bookingError || !booking) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ErrorState
          title="Checkout Load Failed"
          message={bookingErr?.message || 'Could not retrieve booking details.'}
          onRetry={refetchBooking}
        />
      </SafeAreaView>
    );
  }

  const { vehicle } = booking;
  const primaryImage = vehicle?.images?.find((img) => img.isPrimary) || vehicle?.images?.[0];
  const vehicleImageUri = getFullImageUrl(primaryImage?.imageUrl);

  // Price calculations
  const totalPayable = booking.totalAmount;
  // Calculate 18% GST (Tax) dynamically from backend total to show high fidelity breakdown
  const taxAmount = Number((totalPayable * 0.18).toFixed(2));
  const rentalAmount = Number((totalPayable - taxAmount).toFixed(2));

  // Determine button loading state
  const isActionPending =
    checkoutLoading ||
    createOrderMutation.isPending ||
    verifyPaymentMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <AppButton
            title="← Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Secure Checkout</Text>
          <Text style={styles.subtitle}>Complete payment using Razorpay gateway</Text>
        </View>

        {/* Status indicator bar */}
        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Checkout Status</Text>
            <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
        </View>

        {/* Vehicle Information */}
        {vehicle && (
          <View style={styles.card}>
            <View style={styles.vehicleRow}>
              <Image source={{ uri: vehicleImageUri }} style={styles.vehicleImage} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
                <Text style={styles.vehicleTitle}>{vehicle.title}</Text>
                <View style={styles.locationBadge}>
                  <Text style={styles.locationText}>{vehicle.city}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Booking Duration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.dateCol}>
              <Text style={styles.summaryLabel}>Start Date</Text>
              <Text style={styles.summaryVal}>{booking.startDate.split('T')[0]}</Text>
            </View>
            <View style={styles.dateCol}>
              <Text style={styles.summaryLabel}>End Date</Text>
              <Text style={styles.summaryVal}>{booking.endDate.split('T')[0]}</Text>
            </View>
            <View style={styles.durationCol}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryVal}>{booking.totalDays} Days</Text>
            </View>
          </View>
          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.summaryLabel}>Special Requests</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Payment Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceDesc}>Rental Charges</Text>
            <Text style={styles.priceVal}>${rentalAmount}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceDesc}>Taxes & Fees (18% GST)</Text>
            <Text style={styles.priceVal}>${taxAmount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalDesc}>Total Payable</Text>
            <Text style={styles.totalVal}>${totalPayable}</Text>
          </View>

          <View style={styles.secureContainer}>
            <Text style={styles.secureText}>🔒 256-bit Encrypted SSL Gateway</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer / Actions */}
      <View style={styles.footer}>
        {statusInfo.label === 'SUCCESS' ? (
          <AppButton
            title="Go to My Bookings"
            onPress={() => navigation.navigate('BookingTab', { screen: 'MyBookings' })}
            style={styles.successDoneButton}
          />
        ) : statusInfo.label === 'CANCELLED' || statusInfo.label === 'REJECTED' ? (
          <AppButton
            title="Return to Details"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        ) : (
          <AppButton
            title={`Pay Now ($${totalPayable})`}
            onPress={handlePayNow}
            loading={isActionPending}
          />
        )}
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
  statusBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusXl,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: spacing.borderRadiusSm,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.extraBold,
    letterSpacing: 0.5,
  },
  statusDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 90,
    height: 70,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.border,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  vehicleBrand: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  vehicleTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginTop: spacing.xxs,
  },
  locationBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.borderRadiusSm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  locationText: {
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.xxs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1.2,
  },
  durationCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: typography.sizes.md,
    color: colors.white,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xxs,
  },
  notesContainer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  notesText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.sm,
    marginTop: spacing.xxs,
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusXl,
    padding: spacing.md,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalDesc: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  totalVal: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  secureContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secureText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  successDoneButton: {
    backgroundColor: colors.success,
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

export default PaymentScreen;
