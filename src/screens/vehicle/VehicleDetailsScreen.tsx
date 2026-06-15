import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VehicleStackParamList } from '../../navigation/types';

type VehicleDetailsRouteProp = RouteProp<VehicleStackParamList, 'VehicleDetails'>;

export const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<VehicleDetailsRouteProp>();
  const { id } = route.params;

  // Mock fetching vehicle details by ID
  const vehicle = {
    id,
    title: id === '1' ? 'Model S Plaid' : id === '2' ? 'Mustang Shelby GT500' : 'A6 E-Tron',
    brand: id === '1' ? 'Tesla' : id === '2' ? 'Ford' : 'Audi',
    model: id === '1' ? 'Model S' : id === '2' ? 'Mustang' : 'A6',
    pricePerDay: id === '1' ? 150 : id === '2' ? 120 : 95,
    image: id === '1'
      ? 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop'
      : id === '2'
      ? 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format&fit=crop',
    fuelType: id === '1' ? 'ELECTRIC' : id === '2' ? 'PETROL' : 'HYBRID',
    transmission: id === '1' ? 'AUTOMATIC' : id === '2' ? 'MANUAL' : 'AUTOMATIC',
    seatCapacity: id === '1' ? 5 : id === '2' ? 4 : 5,
    city: 'New York',
    description: 'Experience pure speed and high technology. This premium vehicle is fully serviced, clean, and has all modern configurations loaded. Perfect for weekend getaways or showing up in style.',
    ownerName: 'Dhiraj Kumar',
  };

  const handleBookNow = () => {
    // Navigate across stacks to the BookingTab -> BookingScreen route
    navigation.navigate('BookingTab', {
      screen: 'BookingScreen',
      params: {
        vehicleId: vehicle.id,
        pricePerDay: vehicle.pricePerDay,
        title: vehicle.title,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: vehicle.image }} style={styles.headerImage} />

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
              <Text style={styles.specValue}>{vehicle.ownerName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{vehicle.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bookingFooter}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book This Vehicle</Text>
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
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default VehicleDetailsScreen;
