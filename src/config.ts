import { Platform } from 'react-native';

const DEV_API_URL = Platform.select({
  ios: 'http://localhost:8000/api/v1',
  android: 'http://10.0.2.2:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
});

export const Config = {
  API_URL: DEV_API_URL,
  RAZORPAY_KEY_ID: 'rzp_test_mockkeyid123',
};

export default Config;
