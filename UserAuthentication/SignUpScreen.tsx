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
import {ref, set, get} from 'firebase/database';
import {database} from '../firebase/firebase';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebase/firebase';

function SignupScreen({navigation}): React.JSX.Element {
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const navigateToLoginPage = () => {
    navigation.navigate('Login');
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmation) {
      Alert.alert('Something went wrong', 'Please fill out all the fields', [
        {
          text: 'OK',
          onPress: () => console.log('ok'),
        },
      ]);
      console.log('Invalid input');
      return;
    }

    if (password != confirmation) {
      Alert.alert('Something went wrong', 'Password did not match', [
        {
          text: 'OK',
          onPress: () => console.log('ok'),
        },
      ]);

      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log('User registered successfully:', user);
      dispatch(
        setUserDetails({
          userEmail: email,
        }),
      );
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Signup Failed', error.message, [
        {
          text: 'OK',
          onPress: () => console.log('ok'),
        },
      ]);
    }
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
        <Text testID="header-sign-up" style={styles.loginText}>
          Sign Up
        </Text>
      </View>
      <View style={styles.whiteLayer}>
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={text => setName(text)}
            />
            <TextInput
              style={styles.input}
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
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmation}
              onChangeText={text => setConfirmation(text)}
            />
            <TouchableOpacity
              testID="button-sign-up"
              style={styles.signupButton}
              onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <View style={styles.loginContainer}>
              <Text>Already have an account?</Text>
              <Text
                testID="button-sign-in"
                style={styles.textDecorationLogin}
                onPress={navigateToLoginPage}>
                Sign In
              </Text>
            </View>
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
    height: '76%',
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  formContainer: {
    width: '100%',
  },
  textDecorationLogin: {
    textDecorationLine: 'underline',
    color: '#00E0A7',
  },
  loginContainer: {
    alignItems: 'center',
    padding: '5%',
  },
  input: {
    width: '100%',
    height: 55,
    marginBottom: 20,
    padding: 15,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
  },

  inputName: {
    width: '48%',
    height: 55,
    marginBottom: 20,
    padding: 15,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
  },
  signupButton: {
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
    top: '-10%',
    left: '-40%',
    width: 25,
    height: 25,
    aspectRatio: 1,
  },
  inputNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default SignupScreen;
