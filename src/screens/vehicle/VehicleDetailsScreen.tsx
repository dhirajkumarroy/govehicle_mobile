import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useVehicle } from '../../hooks/useVehicles';
import { VehicleStackParamList } from '../../navigation/types';
import Config from '../../config';

type VehicleDetailsRouteProp = RouteProp<VehicleStackParamList, 'VehicleDetails'>;

export const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<VehicleDetailsRouteProp>();
  const { id } = route.params;

  // Fetch real details from backend using the useVehicle hook
  const { data: vehicle, isLoading, isError, error, refetch } = useVehicle(id);

  // Helper function to resolve dynamic image endpoints
  const getFullImageUrl = (imagePath?: string): string => {
    const fallbackImage = 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop';
    if (!imagePath) return fallbackImage;
    if (imagePath.startsWith('http')) return imagePath;

    const baseUrl = Config.API_URL.split('/api/v1')[0];
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  const handleBookNow = () => {
    if (!vehicle) return;
    
    // Navigate across tab stacks to BookingTab -> BookingScreen
    navigation.navigate('BookingTab', {
      screen: 'BookingScreen',
      params: {
        vehicleId: vehicle.id,
        pricePerDay: vehicle.pricePerDay,
        title: vehicle.title,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading vehicle specifications...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !vehicle) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Specification load failed</Text>
        <Text style={styles.errorSub}>{error?.message || 'Vehicle details could not be retrieved.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry Fetch</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Find primary image or use first image
  const primaryImageObj = vehicle.images.find(img => img.isPrimary) || vehicle.images[0];
  const mainImageUri = getFullImageUrl(primaryImageObj?.imageUrl);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: mainImageUri }} style={styles.headerImage} />

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.infoContent}>
          <Text style={styles.brandText}>{vehicle.brand}</Text>
          <Text style={styles.title}>{vehicle.title}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}><Text style={styles.priceAmount}>${vehicle.pricePerDay}</Text> / day</Text>
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>{vehicle.city}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Capacity</Text>
              <Text style={styles.specValue}>{vehicle.seatCapacity} Seats</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Host</Text>
              <Text style={styles.specValue}>{vehicle.owner?.name || 'Owner'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{vehicle.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bookingFooter}>
        <TouchableOpacity
          style={[styles.bookButton, !vehicle.isAvailable && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={!vehicle.isAvailable}
        >
          <Text style={styles.bookButtonText}>
            {vehicle.isAvailable ? 'Book This Vehicle' : 'Currently Booked'}
          </Text>
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
    paddingBottom: 100,
  },
  headerImage: {
    width: '100%',
    height: 280,
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 20,
    backgroundColor: 'rgba(15, 15, 22, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoContent: {
    padding: 24,
  },
  brandText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  priceAmount: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '800',
  },
  locationBadge: {
    backgroundColor: '#1e1e2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e1e2f',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specBox: {
    width: '48%',
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  descriptionText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    fontWeight: '500',
  },
  bookingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161622',
    borderTopWidth: 1,
    borderTopColor: '#1e1e2f',
    padding: 20,
  },
  bookButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#3b3b4f',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
    color: '#ef4444',
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
});

export default VehicleDetailsScreen;
