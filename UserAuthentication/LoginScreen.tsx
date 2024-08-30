import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {setUserDetails} from '../store/actions/userActions';
import {ref, get} from 'firebase/database';
import {database} from '../firebase/firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebase/firebase';

function LoginScreen({navigation}): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Something went wrong', 'Please fill out all the fields', [
        {
          text: 'OK',
          onPress: () => console.log('ok'),
        },
      ]);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log('User logged in successfully:', user);
      dispatch(
        setUserDetails({
          userEmail: email,
        }),
      );
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Failed', error.message, [
        {
          text: 'OK',
          onPress: () => console.log('ok'),
        },
      ]);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('Signup');
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <TouchableOpacity testID="back-button" onPress={navigateBack}>
          <Image
            style={styles.image}
            source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-left-24.png')}
          />
        </TouchableOpacity>
        <Text testID="header-sign-in" style={styles.loginText}>
          Sign In
        </Text>
      </View>
      <View style={styles.whiteLayer}>
        <KeyboardAvoidingView behavior="padding" style={styles.formContainer}>
          <TextInput
            style={[styles.input, {marginTop: '10%'}]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={text => setEmail(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={text => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.button}
            testID="button-sign-in"
            onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <View style={styles.signUpStyle}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Text style={styles.signUpButton} onPress={navigateToSignUp}>
              Sign Up
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '25%',
    backgroundColor: '#00E0A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteLayer: {
    width: '100%',
    height: '78%',
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 55,
    marginBottom: 20,
    padding: 15,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 100,
    backgroundColor: '#00E0A7',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  signUpStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    marginBottom: 5,
  },
  signUpButton: {
    textDecorationLine: 'underline',
    color: '#00E0A7',
  },
  backgroundLayerTextArea: {
    marginTop: '6%',
    display: 'flex',
    padding: '5%',
  },
  loginText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    paddingTop: '7%',
  },
  backButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    position: 'absolute',
    width: 25,
    height: 25,
    aspectRatio: 1,
    top: '-10%',
    left: '-40%',
  },
});

export default LoginScreen;
