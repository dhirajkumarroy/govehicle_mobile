import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/types';

const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address format'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^\+?\d+$/, 'Phone number must contain only digits (optionally starting with +)'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=\[\]{}|\\:;"'<>,.?/~`]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  role: z.enum(['CUSTOMER', 'OWNER']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterFormData) => {
    dispatch(clearError());
    dispatch(registerUser(data))
      .unwrap()
      .then((message) => {
        Alert.alert(
          'Registration Successful',
          message || 'Please check your email to verify your OTP.',
          [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
        );
      })
      .catch((err) => {
        // Handled in auth state error
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Join GoVehicle</Text>
          <Text style={styles.subtitle}>Create your profile to start list or rent vehicles</Text>
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && <Text style={styles.validationError}>{errors.name.message}</Text>}

          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#64748b"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && <Text style={styles.validationError}>{errors.email.message}</Text>}

          {/* Phone Input */}
          <Text style={styles.label}>Phone Number</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="e.g. +919900000001"
                placeholderTextColor="#64748b"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.phone && <Text style={styles.validationError}>{errors.phone.message}</Text>}

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Enter secure password"
                  placeholderTextColor="#64748b"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.visibilityToggle}
                >
                  <Text style={styles.visibilityText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && <Text style={styles.validationError}>{errors.password.message}</Text>}

          {/* Role Toggle Selector */}
          <Text style={styles.label}>Register As</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'CUSTOMER' && styles.roleOptionActive,
              ]}
              onPress={() => setValue('role', 'CUSTOMER')}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  selectedRole === 'CUSTOMER' && styles.roleOptionTextActive,
                ]}
              >
                Customer (Renter)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'OWNER' && styles.roleOptionActive,
              ]}
              onPress={() => setValue('role', 'OWNER')}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  selectedRole === 'OWNER' && styles.roleOptionTextActive,
                ]}
              >
                Owner (Host)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Login Redirect */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => {
              dispatch(clearError());
              navigation.navigate('Login');
            }}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f16',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#161622',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e1e2f',
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
  label: {
    fontSize: 14,
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
    marginBottom: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  validationError: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: -10,
    marginBottom: 16,
  },
  visibilityToggle: {
    justifyContent: 'center',
  },
  visibilityText: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontSize: 13,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleOption: {
    flex: 0.48,
    backgroundColor: '#1e1e2f',
    borderColor: '#2d2d44',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  roleOptionTextActive: {
    color: '#a78bfa',
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  footerLink: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RegisterScreen;
