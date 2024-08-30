import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../UserAuthentication/LoginScreen';
import SignupScreen from '../UserAuthentication/SignUpScreen';
import OnBoardingScreen from '../UserAuthentication/OnBoarding/OnboardingScreen';
const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false, title: ''}}
        name="Welcome"
        component={OnBoardingScreen}
      />
      <Stack.Screen
        options={{headerShown: false, title: ''}}
        name="Login"
        component={LoginScreen}
      />
      <Stack.Screen
        options={{headerShown: false, title: ''}}
        name="Signup"
        component={SignupScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
