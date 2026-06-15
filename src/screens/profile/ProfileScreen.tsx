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
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser, updateUser } from '../../store/slices/authSlice';
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '../../hooks/useProfile';
import Config from '../../config';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  // Fetch Redux state user as baseline
  const reduxUser = useAppSelector((state) => state.auth.user);

  // React Query Profile hook
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isRefetching,
    refetch,
    isError,
  } = useUserProfile();

  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  // Active user data
  const user = profileData || reduxUser;

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Keep state inputs synchronized when hook queries complete
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone number cannot be empty.');
      return;
    }

    updateProfileMutation.mutate(
      { name, phone },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile details updated successfully.');
        },
        onError: (err: any) => {
          Alert.alert('Update Failed', err.message || 'Could not update profile details.');
        },
      }
    );
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Gallery access permissions are required to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera permissions are required to take a picture.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';

    // Infer image type extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    uploadAvatarMutation.mutate(formData, {
      onSuccess: (updatedUser) => {
        Alert.alert('Success', 'Profile image uploaded successfully.');
      },
      onError: (err: any) => {
        Alert.alert('Upload Failed', err.message || 'Could not upload profile picture.');
      },
    });
  };

  const handleSelectAvatar = () => {
    Alert.alert(
      'Update Profile Image',
      'Choose a source for your avatar:',
      [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of GoVehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logoutUser());
        },
      },
    ]);
  };

  const getFullImageUrl = (imagePath?: string | null): string | null => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    const baseUrl = Config.API_URL.split('/api/v1')[0];
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  const avatarUri = getFullImageUrl(user?.avatar);

  const isSaving = updateProfileMutation.isPending;
  const isUploading = uploadAvatarMutation.isPending;

  if (isProfileLoading && !user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Fetching profile records...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#8b5cf6"
            colors={['#8b5cf6']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Customize your account details and options</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleSelectAvatar} disabled={isUploading}>
            {isUploading ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handleSelectAvatar}
            disabled={isUploading}
          >
            <Text style={styles.uploadBtnText}>
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address (Immutable)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Account Type</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.role}
            editable={false}
          />

          {/* Action buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleUpdateProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passwordBtn}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.passwordBtnText}>Change Account Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log Out Account</Text>
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
    paddingTop: 20,
    marginBottom: 24,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#161622',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
  },
  uploadBtn: {
    backgroundColor: '#161622',
    borderColor: '#1e1e2f',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  uploadBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: '#0f0f16',
    borderColor: '#1e1e2f',
    color: '#64748b',
  },
  saveBtn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  saveBtnDisabled: {
    backgroundColor: '#4c1d95',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordBtn: {
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordBtnText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutBtn: {
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
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
});

export default ProfileScreen;
