// // src/navigation/AuthNavigator.tsx
// // Updated — adds OTPScreen for two-step registration

// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import OTPScreen from '../screens/auth/OTPScreen';
// import { COLORS } from '../constants/colors';

// export type AuthStackParamList = {
//   Login: undefined;
//   Register: undefined;
//   OTP: {
//     email: string;
//     firstName: string;
//     lastName: string;
//   };
//   ForgotPassword: undefined;
// };

// const Stack = createNativeStackNavigator<AuthStackParamList>();

// export default function AuthNavigator() {
//   return (
//     <Stack.Navigator
//       initialRouteName="Login"
//       screenOptions={{
//         headerShown: false,
//         animation: 'slide_from_right',
//         contentStyle: { backgroundColor: COLORS.background },
//       }}
//     >
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Register" component={RegisterScreen} />
//       <Stack.Screen name="OTP" component={OTPScreen} />
//     </Stack.Navigator>
//   );
// }

// src/navigation/AuthNavigator.tsx
// Updated — ForgotPassword screen now wired in

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import { COLORS } from '../constants/colors';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: {
    email: string;
    firstName?: string;
    lastName?: string;
    canResendImmediately?: boolean;
  };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
