import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {signOut, setProfileImage} from '../store/actions/userActions';
import {ref, onValue} from 'firebase/database';
import {database} from '../firebase/firebase';

const ProfileScreen = () => {
  const userEmail = useSelector(state => state.user.userEmail);
  const profileImage = useSelector(state => state.user.profileImage);

  console.log(profileImage, 'edeu');

  const [name, setName] = useState('');
  // const [profileImage, setProfileImage] = useState(null);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const userEmailKey = userEmail.replace('.', ',');
    const userRef = ref(database, 'users/' + userEmailKey);
    const unsubscribe = onValue(userRef, snapshot => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setName(userData.name);
      } else {
        console.log('No data available');
      }
    });

    return () => unsubscribe();
  }, [userEmail]);

  const handleOptionPress = option => {
    switch (option) {
      case 'Analytics':
        navigation.navigate('AnalyticsScreen');
        break;
      case 'Sign Out':
        dispatch(signOut());
        navigation.navigate('Login');
        break;

      case 'Search History':
        navigation.navigate('SearchHistoryScreen');
        break;
      case 'Edit Profile':
        navigation.navigate('EditProfileScreen');
        break;

      default:
        console.log('Option not handled:', option);
    }
  };

  const openGallery = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {uri: response.assets[0].uri};
        dispatch(setProfileImage(source.uri));
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage.startsWith('file:///')
                    ? profileImage
                    : 'file://' + profileImage,
                }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.profileInitials}>{name ? name[0] : ''}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editIcon} onPress={openGallery}>
            <Image
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-edit-50.png')}
              style={styles.editIconImage}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bodyContent}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.optionsContainer}>
            {['Edit Profile', 'Search History', 'Analytics'].map(
              (option, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.button_options}
                    onPress={() => handleOptionPress(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                    <Image
                      style={styles.image}
                      source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-right-30.png')}
                    />
                  </TouchableOpacity>
                </React.Fragment>
              ),
            )}
            <View style={styles.signOutContainer}>
              <TouchableOpacity
                style={styles.button_options}
                onPress={() => handleOptionPress('Sign Out')}>
                <Text style={styles.optionText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#00E0A7',
  },
  header: {
    height: '20%',
    zIndex: 1,
    backgroundColor: '#00E0A7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 20,
  },
  container: {
    flexGrow: 1,
  },
  bodyContent: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 100,
  },
  profileIcon: {
    width: 150,
    height: 150,
    top: '70%',
    borderRadius: 100,
    backgroundColor: '#f6f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'black',
    padding: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileInitials: {
    color: 'black',
    fontSize: 70,
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
  },
  editIconImage: {
    width: 20,
    height: 20,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  optionsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signOutContainer: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  button_options: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 100,
    backgroundColor: '#ccc',
    marginTop: 20,
  },
  image: {
    width: 25,
    height: 25,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ProfileScreen;
