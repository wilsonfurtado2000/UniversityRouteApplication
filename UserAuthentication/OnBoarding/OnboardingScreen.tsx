import React from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';

function OnBoardingScreen({navigation}): React.JSX.element {
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const navigateToSignUp = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Image
        testID="onboarding-image"
        style={styles.image}
        resizeMode="contain"
        source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/uni_of_bath.png')}
      />
      <Text style={styles.description}>
        Navigate Your Campus with Confidence
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.signUpStyle}>
          <Text>Don't have an account? </Text>
          <Text style={styles.signUpButton} onPress={navigateToSignUp}>
            Sign Up
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '50%',
    height: 'auto',
    aspectRatio: 1,
    marginTop: '30%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '20%',
  },
  button: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    cursor: 'pointer',
    borderRadius: 100,
    backgroundColor: '#00E0A7',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  description: {
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  signUpStyle: {
    alignItems: 'center',
    padding: '5%',
  },
  signUpButton: {
    textDecorationLine: 'underline',
    color: '#00E0A7',
  },
});

export default OnBoardingScreen;
