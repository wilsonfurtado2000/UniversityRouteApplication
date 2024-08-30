import React from 'react';
import {StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import AppNavigator from './navigation/AppNavigator';
import {NavigationContainer} from '@react-navigation/native';
import ScreenTime from './screenTime/ScreenTime';

function App({isLoggedIn}) {
  return (
    <NavigationContainer>
      <ScreenTime />
      <AppNavigator isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
}

const mapStateToProps = state => ({
  isLoggedIn: !!state.user.userEmail,
});

export default connect(mapStateToProps)(App);
