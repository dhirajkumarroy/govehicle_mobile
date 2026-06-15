export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  OwnerDashboard: undefined;
};

export type VehicleStackParamList = {
  VehicleList: undefined;
  VehicleDetails: { id: string };
};

export type BookingStackParamList = {
  MyBookings: undefined;
  BookingScreen: { vehicleId: string; pricePerDay: number; title: string };
  PaymentScreen: { bookingId: string; amount: number };
};

export type AppTabParamList = {
  HomeTab: undefined;
  VehicleTab: undefined;
  BookingTab: undefined;
  NotificationTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  AuthStack: undefined;
  AppStack: undefined;
};
