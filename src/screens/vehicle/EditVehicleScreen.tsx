import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useVehicle } from '../../hooks/useVehicles';
import { useUpdateVehicle } from '../../hooks/useOwner';
import { HomeStackParamList } from '../../navigation/types';

type EditVehicleScreenRouteProp = RouteProp<HomeStackParamList, 'EditVehicle'>;

export const EditVehicleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditVehicleScreenRouteProp>();
  const { vehicleId } = route.params;

  // Fetch the vehicle details to edit
  const { data: vehicle, isLoading: vehicleLoading, isError } = useVehicle(vehicleId);
  const updateVehicleMutation = useUpdateVehicle();

  // Form states
  const [brand, setBrand] = useState('');
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID'>('PETROL');
  const [transmission, setTransmission] = useState<'MANUAL' | 'AUTOMATIC'>('AUTOMATIC');
  const [seatCapacity, setSeatCapacity] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Prepopulate form when vehicle data is loaded
  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setTitle(vehicle.title);
      setModel(vehicle.model);
      setYear(String(vehicle.year));
      setVehicleNumber(vehicle.vehicleNumber);
      setPricePerDay(String(vehicle.pricePerDay));
      setFuelType(vehicle.fuelType);
      setTransmission(vehicle.transmission);
      setSeatCapacity(String(vehicle.seatCapacity));
      setCity(vehicle.city);
      setDescription(vehicle.description);
      setLatitude(String(vehicle.latitude));
      setLongitude(String(vehicle.longitude));
    }
  }, [vehicle]);

  const handleSubmit = () => {
    // Validations
    if (!brand.trim() || !title.trim() || !model.trim() || !vehicleNumber.trim() || !city.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const yearNum = parseInt(year);
    const seatNum = parseInt(seatCapacity);
    const priceNum = parseFloat(pricePerDay);
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 2) {
      Alert.alert('Validation Error', 'Please enter a valid year.');
      return;
    }
    if (isNaN(seatNum) || seatNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid seat capacity.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid rate per day.');
      return;
    }

    updateVehicleMutation.mutate(
      {
        id: vehicleId,
        payload: {
          brand: brand.trim(),
          title: title.trim(),
          model: model.trim(),
          year: yearNum,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          fuelType,
          transmission,
          seatCapacity: seatNum,
          pricePerDay: priceNum,
          city: city.trim(),
          latitude: isNaN(latNum) ? 19.0760 : latNum,
          longitude: isNaN(lonNum) ? 72.8777 : lonNum,
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Listing updated successfully!', [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]);
        },
        onError: (err: any) => {
          Alert.alert('Update Failed', err.message || 'Could not update vehicle.');
        },
      }
    );
  };

  const isPending = updateVehicleMutation.isPending;

  if (vehicleLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Fetching listing records...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !vehicle) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading listing details.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Listings</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Listing</Text>
          <Text style={styles.subtitle}>Update parameters for {vehicle.brand} {vehicle.title}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Title / Name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter name"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Model Version</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Enter model details"
            placeholderTextColor="#64748b"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="2023"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Seat Capacity</Text>
              <TextInput
                style={styles.input}
                value={seatCapacity}
                onChangeText={setSeatCapacity}
                placeholder="5"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Vehicle Plate Number (Unique)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={vehicleNumber}
            editable={false}
          />

          <Text style={styles.label}>Daily Rental Rate ($)</Text>
          <TextInput
            style={styles.input}
            value={pricePerDay}
            onChangeText={setPricePerDay}
            placeholder="100"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
          />

          {/* Type selectors */}
          <Text style={styles.label}>Fuel Type</Text>
          <View style={styles.selectorGrid}>
            {(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.selectBox, fuelType === type && styles.selectBoxActive]}
                onPress={() => setFuelType(type)}
              >
                <Text style={[styles.selectBoxText, fuelType === type && styles.selectBoxTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Transmission</Text>
          <View style={styles.selectorGrid}>
            {(['AUTOMATIC', 'MANUAL'] as const).map((trans) => (
              <TouchableOpacity
                key={trans}
                style={[styles.selectBox, transmission === trans && styles.selectBoxActive]}
                onPress={() => setTransmission(trans)}
              >
                <Text style={[styles.selectBoxText, transmission === trans && styles.selectBoxTextActive]}>
                  {trans}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>City Location</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
            placeholderTextColor="#64748b"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                placeholder="19.0760"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                placeholder="72.8777"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Listing Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe vehicle health..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
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
  form: {
    backgroundColor: '#161622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    padding: 24,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 10,
  },
  disabledInput: {
    backgroundColor: '#0f0f16',
    borderColor: '#1e1e2f',
    color: '#64748b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectBox: {
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectBoxActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  selectBoxText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  selectBoxTextActive: {
    color: '#a78bfa',
  },
  submitBtn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  submitBtnDisabled: {
    backgroundColor: '#4c1d95',
  },
  submitBtnText: {
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
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditVehicleScreen;
