import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Platform } from 'react-native';
import { useAppSelector } from '../store';
import { useUnreadCount } from '../hooks/useNotifications';
import {
  AuthStackParamList,
  HomeStackParamList,
  VehicleStackParamList,
  BookingStackParamList,
  AppTabParamList,
  ProfileStackParamList,
} from './types';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Home Screens
import HomeScreen from '../screens/home/HomeScreen';
import OwnerDashboardScreen from '../screens/home/OwnerDashboardScreen';

// Vehicle Screens
import VehicleListScreen from '../screens/vehicle/VehicleListScreen';
import VehicleDetailsScreen from '../screens/vehicle/VehicleDetailsScreen';

// Booking Screens
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';

// Notification Screen
import NotificationsScreen from '../screens/notification/NotificationsScreen';

// Profile Screen
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const VehicleStack = createNativeStackNavigator<VehicleStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// 1. Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// 2. Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
    </HomeStack.Navigator>
  );
};

// 3. Vehicle Stack Navigator
const VehicleStackNavigator = () => {
  return (
    <VehicleStack.Navigator screenOptions={{ headerShown: false }}>
      <VehicleStack.Screen name="VehicleList" component={VehicleListScreen} />
      <VehicleStack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
    </VehicleStack.Navigator>
  );
};

// 4. Booking Stack Navigator
const BookingStackNavigator = () => {
  return (
    <BookingStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <BookingStack.Screen name="BookingScreen" component={BookingScreen} />
      <BookingStack.Screen name="PaymentScreen" component={PaymentScreen} />
    </BookingStack.Navigator>
  );
};

// 4.5. Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </ProfileStack.Navigator>
  );
};

// 5. Main App Bottom Tab Navigator
const AppTabNavigator = () => {
  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.count || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color }) => {
          let icon = '';
          if (route.name === 'HomeTab') icon = '🏠';
          else if (route.name === 'VehicleTab') icon = '🚗';
          else if (route.name === 'BookingTab') icon = '📅';
          else if (route.name === 'NotificationTab') icon = '🔔';
          else if (route.name === 'ProfileTab') icon = '👤';

          return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="VehicleTab"
        component={VehicleStackNavigator}
        options={{ tabBarLabel: 'Vehicles' }}
      />
      <Tab.Screen
        name="BookingTab"
        component={BookingStackNavigator}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen
        name="NotificationTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: 10,
            lineHeight: 14,
          },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isResolved } = useAppSelector((state) => state.auth);

  if (!isResolved) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <AppTabNavigator /> : <AuthStackNavigator />;
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#161622',
    borderTopWidth: 1,
    borderTopColor: '#1e1e2f',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default RootNavigator;
