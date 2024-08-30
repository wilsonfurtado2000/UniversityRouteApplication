import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {ref, get, query, orderByChild, remove} from 'firebase/database';
import {database} from '../firebase/firebase';
import SegmentedControlTab from 'react-native-segmented-control-tab';

function SearchHistoryScreen({navigation}) {
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [places, setPlaces] = useState([]);
  const userEmail = useSelector(state => state.user.userEmail);
  const timeFilters = ['1 Day', '1 Week', '2 Weeks', '1 Month'];
  const timeDays = [1, 7, 14, 30];

  useEffect(() => {
    const now = Date.now();
    const dayInMillis = 24 * 60 * 60 * 1000;
    const pastTime = now - timeDays[selectedFilterIndex] * dayInMillis;

    const placesRef = ref(
      database,
      `destinations/${userEmail.replace('.', ',')}/userDestinations`,
    );
    const queryRef = query(placesRef, orderByChild('createdAt'));

    get(queryRef)
      .then(snapshot => {
        const fetchedPlaces = [];
        snapshot.forEach(childSnapshot => {
          const place = childSnapshot.val();
          if (place.createdAt >= pastTime) {
            fetchedPlaces.push(place);
          }
        });
        setPlaces(fetchedPlaces.reverse());
      })
      .catch(error => {
        console.error('Error fetching places:', error);
      });
  }, [selectedFilterIndex, userEmail]);

  const renderPlace = ({item}) => (
    <View style={styles.placeContainer}>
      <Text style={styles.placeName}>{item.name}</Text>
    </View>
  );

  const navigateBack = () => {
    navigation.goBack();
  };

  const deleteHistory = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete all history?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => {
            const historyRef = ref(
              database,
              `destinations/${userEmail.replace('.', ',')}/userDestinations`,
            );
            remove(historyRef)
              .then(() => {
                Alert.alert(
                  'History Deleted',
                  'All search history has been successfully deleted.',
                );
                setPlaces([]);
              })
              .catch(error => {
                console.error('Error deleting history:', error);
                Alert.alert('Error', 'Failed to delete history.');
              });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <TouchableOpacity
          testID="back-button"
          onPress={navigateBack}
          style={styles.backButton}>
          <Image
            style={styles.image}
            source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-left-24.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Search History</Text>
      </View>
      <View style={styles.whiteLayer}>
        <SegmentedControlTab
          values={timeFilters}
          selectedIndex={selectedFilterIndex}
          onTabPress={setSelectedFilterIndex}
          tabsContainerStyle={styles.tabsContainer}
          tabStyle={styles.tabStyle}
          activeTabStyle={styles.activeTabStyle}
          tabTextStyle={styles.tabTextStyle}
          activeTabTextStyle={styles.activeTabTextStyle}
        />
        <FlatList
          data={places}
          renderItem={renderPlace}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data to display 🤷‍♂️</Text>
            </View>
          )}
        />
        <TouchableOpacity style={styles.deleteButton} onPress={deleteHistory}>
          <Text style={styles.deleteButtonText}>Delete All History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00E0A7',
  },
  backgroundLayer: {
    height: '25%',
    backgroundColor: '#00E0A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  whiteLayer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  tabsContainer: {
    marginBottom: 20,
    marginLeft: -5,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  tabStyle: {
    borderColor: '#F5F5F5',
    paddingVertical: 10,
    minWidth: 90,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  activeTabStyle: {
    backgroundColor: '#00E0A7',
    borderRadius: 10,
  },
  tabTextStyle: {
    color: '#A5A5A5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabTextStyle: {
    color: '#FFFFFF',
  },
  placeContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  placeName: {
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  image: {
    width: 24,
    height: 24,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#A5A5A5',
  },
  deleteButton: {
    backgroundColor: '#00E0A7',
    padding: 15,
    marginTop: 10,
    borderRadius: 50,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SearchHistoryScreen;
