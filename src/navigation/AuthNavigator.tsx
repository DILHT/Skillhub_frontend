import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { COLORS } from '../constants/colors';
// import OTPScreen from '../screens/auth/OTPScreen';  // Add in later lesson
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
 
// Define the params each screen accepts
// If LoginScreen needs no params: LoginScreen: undefined
// If OTPScreen needs a phone: OTPScreen: { phone: string }
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: { phone: string };
  ForgotPassword: undefined;
};
 
const Stack = createNativeStackNavigator<AuthStackParamList>();
 
export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        // Remove the default header — we build our own in each screen
        headerShown: false,
        // Smooth animation
        animation: 'slide_from_right',
        // Consistent background
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* <Stack.Screen name="OTP" component={OTPScreen} /> */}
      {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
    </Stack.Navigator>
  );
}