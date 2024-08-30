import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {getDatabase, ref, onValue, update} from 'firebase/database';
import {useSelector, useDispatch} from 'react-redux';
import {setUserDetails} from '../store/actions/userActions';

const EditProfileScreen = ({navigation}) => {
  const userEmail = useSelector(state => state.user.userEmail);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const userEmailKey = userEmail.replace('.', ',');
    const userRef = ref(db, 'users/' + userEmailKey);

    const unsubscribe = onValue(userRef, snapshot => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setName(userData.name);
        setOriginalName(userData.name);
      }
    });

    return () => unsubscribe();
  }, [userEmail]);

  useEffect(() => {
    setHasChanges(name !== originalName);
  }, [name, originalName]);

  const saveChanges = () => {
    const db = getDatabase();
    const userEmailKey = userEmail.replace('.', ',');

    updateUserData(db, userEmailKey);
  };

  const updateUserData = (db, userEmailKey) => {
    const userRef = ref(db, 'users/' + userEmailKey);

    update(userRef, {
      name: name,
    })
      .then(() => {
        dispatch(
          setUserDetails({
            userEmail: userEmail,
          }),
        );
        Alert.alert('Success', 'Profile changes saved successfully.');
      })
      .catch(error => {
        Alert.alert(
          'Error',
          'Failed to save profile changes. Please try again.',
        );
        console.error('Error saving profile:', error);
      });
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#00E0A7'}}>
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Image
            style={styles.image}
            source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-left-24.png')}
          />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit Profile</Text>
      </View>
      <View style={styles.bottomContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <TouchableOpacity
            style={[styles.button, hasChanges ? {} : {backgroundColor: '#ccc'}]}
            onPress={saveChanges}
            disabled={!hasChanges}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
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
  safeArea: {
    flex: 1,
    backgroundColor: '#00E0A7',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E0A7',
    height: '20%',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
  },
  bottomContainer: {
    backgroundColor: 'white',
    height: '80%',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  input: {
    width: '100%',
    height: 55,
    marginBottom: 20,
    padding: 15,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: 25,
    height: 25,
  },
  formContainer: {
    width: '100%',
  },
});
