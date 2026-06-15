import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BookingStackParamList } from '../../navigation/types';
import { useBooking } from '../../hooks/useBookings';
import { useCreateOrder, useVerifyPayment, useMyPayments } from '../../hooks/usePayments';
import { useAppSelector } from '../../store';
import Config from '../../config';
import RazorpayCheckout from 'react-native-razorpay';

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
        color: '#10b981',
        description: 'Payment verified and booking confirmed.',
      };
    }
    if (booking?.status === 'CANCELLED') {
      return {
        label: 'CANCELLED',
        color: '#f43f5e',
        description: 'Booking reservation has been cancelled.',
      };
    }
    if (booking?.status === 'REJECTED') {
      return {
        label: 'REJECTED',
        color: '#f43f5e',
        description: 'Booking reservation has been rejected by owner.',
      };
    }

    if (activePayment) {
      switch (activePayment.status) {
        case 'SUCCESS':
          return {
            label: 'SUCCESS',
            color: '#10b981',
            description: 'Payment verified and booking confirmed.',
          };
        case 'FAILED':
          return {
            label: 'FAILED',
            color: '#f43f5e',
            description: 'Previous transaction failed. Please retry.',
          };
        case 'REFUNDED':
          return {
            label: 'REFUNDED',
            color: '#64748b',
            description: 'Payment was refunded.',
          };
        case 'PENDING':
        default:
          return {
            label: 'PENDING',
            color: '#8b5cf6',
            description: 'Awaiting checkout authorization.',
          };
      }
    }

    return {
      label: 'PENDING',
      color: '#8b5cf6',
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
          color: '#8b5cf6', // Indigo Violet accent
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

  // Simulation handler to verify payments on backend with simulated signatures in test mode
  // Note: Backend verification requires a real signature unless it is a mock environment.
  // In development, the user can verify they get order creation. Let's send standard mock signature
  // and see if the backend allows mock, or we notify them.
  const handleSimulatedPaymentSuccess = async (razorpayOrderId: string) => {
    setCheckoutLoading(true);
    try {
      // Create mock verification signature payloads
      // (Backend will throw invalid signature if backend keys are real, but in test mode this allows full testing)
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
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Fetching checkout records...</Text>
      </SafeAreaView>
    );
  }

  if (bookingError || !booking) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Checkout Load Failed</Text>
        <Text style={styles.errorSub}>
          {bookingErr?.message || 'Could not retrieve booking details.'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetchBooking()}>
          <Text style={styles.retryBtnText}>Retry Fetch</Text>
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.successDoneButton}
            onPress={() => navigation.navigate('BookingTab', { screen: 'MyBookings' })}
          >
            <Text style={styles.successDoneButtonText}>Go to My Bookings</Text>
          </TouchableOpacity>
        ) : statusInfo.label === 'CANCELLED' || statusInfo.label === 'REJECTED' ? (
          <TouchableOpacity
            style={styles.cancelDoneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelDoneButtonText}>Return to Details</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.confirmButton, isActionPending && styles.confirmButtonDisabled]}
            onPress={handlePayNow}
            disabled={isActionPending}
          >
            {isActionPending ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator color="#ffffff" style={styles.btnSpinner} />
                <Text style={styles.confirmButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>Pay Now (${totalPayable})</Text>
            )}
          </TouchableOpacity>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 110,
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
  statusBox: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDescription: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#161622',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 90,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#1e1e2f',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  vehicleBrand: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  locationBadge: {
    backgroundColor: '#1e1e2f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  locationText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 10,
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
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '700',
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2f',
    paddingTop: 12,
  },
  notesText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 4,
  },
  pricingCard: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 16,
    padding: 18,
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
  divider: {
    height: 1,
    backgroundColor: '#1e1e2f',
    marginVertical: 14,
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
  secureContainer: {
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2f',
  },
  secureText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
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
    color: '#f43f5e',
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
  confirmButtonDisabled: {
    backgroundColor: '#4c1d95',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  successDoneButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successDoneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelDoneButton: {
    backgroundColor: '#1e1e2f',
    borderWidth: 1,
    borderColor: '#2d2d44',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelDoneButtonText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSpinner: {
    marginRight: 8,
  },
});

export default PaymentScreen;
