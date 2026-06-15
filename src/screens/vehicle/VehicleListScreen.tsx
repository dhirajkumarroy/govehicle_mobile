import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VehicleStackParamList } from '../../navigation/types';

interface VehicleMock {
  id: string;
  title: string;
  brand: string;
  model: string;
  pricePerDay: number;
  image: string;
  fuelType: string;
  transmission: string;
  rating: number;
}

const MOCK_VEHICLES: VehicleMock[] = [
  {
    id: '1',
    title: 'Model S Plaid',
    brand: 'Tesla',
    model: 'Model S',
    pricePerDay: 150,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500&auto=format&fit=crop',
    fuelType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    rating: 4.9,
  },
  {
    id: '2',
    title: 'Mustang Shelby GT500',
    brand: 'Ford',
    model: 'Mustang',
    pricePerDay: 120,
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=500&auto=format&fit=crop',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    rating: 4.8,
  },
  {
    id: '3',
    title: 'A6 E-Tron',
    brand: 'Audi',
    model: 'A6',
    pricePerDay: 95,
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=500&auto=format&fit=crop',
    fuelType: 'HYBRID',
    transmission: 'AUTOMATIC',
    rating: 4.7,
  },
];

export const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<VehicleStackParamList>>();
  const [search, setSearch] = useState('');

  const filteredVehicles = MOCK_VEHICLES.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: VehicleMock }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VehicleDetails', { id: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.ratingText}>★ {item.rating}</Text>
        </View>
        <Text style={styles.cardSubtitle}>{item.brand} • {item.model}</Text>
        
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.fuelType}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.transmission}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}><Text style={styles.priceAmount}>${item.pricePerDay}</Text>/day</Text>
          <Text style={styles.bookNow}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Ride</Text>
        <Text style={styles.subtitle}>Rent premium cars near you instantly</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search brand, model..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f16',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: '#161622',
    borderColor: '#1e1e2f',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
    marginTop: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#161622',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardInfo: {
    padding: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  ratingText: {
    color: '#eab308',
    fontWeight: '700',
    fontSize: 13,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#1e1e2f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
    paddingTop: 14,
  },
  price: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  priceAmount: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '800',
  },
  bookNow: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default VehicleListScreen;
