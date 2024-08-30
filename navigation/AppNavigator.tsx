import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AuthNavigator from './AuthNavigator';
import MapScreen from '../mapScreen/MapScreen';
import ProfileScreen from '../profile/ProfileScreen';
import EditProfileScreen from '../edit_profile/EditProfileScreen';
import SearchHistoryScreen from '../search_history/SearchHistoryScreen';
import {Image} from 'react-native';
import AnalyticsScreen from '../analytics/AnalyticsScreen';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SearchHistoryScreen"
        component={SearchHistoryScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AnalyticsScreen"
        component={AnalyticsScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused
              ? require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-home-50_filled.png')
              : require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-home-50.png');
          } else if (route.name === 'Profile') {
            iconName = focused
              ? require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-male-user-50_filled.png')
              : require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-male-user-50.png');
          }

          return <Image source={iconName} style={{width: 25, height: 25}} />;
        },
        tabBarActiveTintColor: '#00E0A7',
        tabBarInactiveTintColor: 'black',
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}>
      <Tab.Screen
        options={{headerShown: false}}
        name="Home"
        component={MapScreen}
      />
      <Tab.Screen
        options={{headerShown: false}}
        name="Profile"
        component={ProfileStackNavigator}
      />
    </Tab.Navigator>
  );
}

const AppNavigator: React.FC = ({isLoggedIn}) => {
  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{headerShown: false}}
        />
      ) : (
        <Stack.Screen
          name="Authenticate"
          component={AuthNavigator}
          options={{headerShown: false}}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
