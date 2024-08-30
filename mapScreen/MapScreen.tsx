import React, {useState, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  SafeAreaView,
  Modal,
  Image,
  FlatList,
  Text,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {fetchPlaces} from './fetchPlaces';
import {database} from '../firebase/firebase';
import {ref, serverTimestamp, push} from 'firebase/database';

const {RNLocationManager} = NativeModules;

const MapScreen = () => {
  const [position, setPosition] = useState([0, 0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [places, setPlaces] = useState([]);
  const [destination, setDestination] = useState(null);
  const userEmail = useSelector(state => state.user.userEmail);
  const [source, setSource] = useState({
    name: 'Your current location',
    coordinates: {lat: position[0], lon: position[1]},
  });
  const [sourceSearch, setSourceSearch] = useState('Your current location');
  const [inputFocused, setInputFocused] = useState('none');
  const [selectAll, setSelectAll] = useState(true);
  const [message, setMessage] = useState('');
  const [dist, setDist] = useState('');
  const [time, setTime] = useState('');
  const [formatTime, setFormatTime] = useState('');
  const inputRef = useRef(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [routingProfile, setRoutingProfile] = useState('foot');

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(RNLocationManager);
    const locationSubscription = eventEmitter.addListener(
      'LocationUpdated',
      location => {
        if (position[0] == 0 && position[1] == 0) {
          console.log('yes position is zero zero');
          setPosition([location.latitude, location.longitude]);
        }
        if (navigationStarted) {
          setPosition([location.latitude, location.longitude]);

          // if (destination) {
          //   const distanceToDestination = calculateDistance(currentPosition, [
          //     destination.coordinates.lat,
          //     destination.coordinates.lon,
          //   ]);

          //   if (distanceToDestination <= destinationProximityThreshold) {
          //     if (!hasReachedDestination) {
          //       // Prevent multiple alerts
          //       setHasReachedDestination(true);
          //       Alert.alert(
          //         'Destination Reached',
          //         'You have arrived at your destination.',
          //         [{text: 'OK', onPress: resetSelection}],
          //       );
          //     }
          //   }
          // }

          // if (source.name === 'Your current location') {
          //   setSource({
          //     name: 'Your current location',
          //     coordinates: {lat: location.latitude, lon: location.longitude},
          //   });
          // }
        }
        console.log('Updated location: from React native side', location);
      },
    );

    fetchPlaces().then(setPlaces);

    RNLocationManager.startUpdatingLocation();

    return () => {
      locationSubscription.remove();
      RNLocationManager.stopUpdatingLocation();
    };
  }, [routingProfile, navigationStarted]);

  // const calculateDistance = (coords1, coords2) => {
  //   const toRad = x => (x * Math.PI) / 180;

  //   const lat1 = coords1[0];
  //   const lon1 = coords1[1];
  //   const lat2 = coords2[0];
  //   const lon2 = coords2[1];

  //   const R = 6371e3; // meters
  //   const φ1 = toRad(lat1);
  //   const φ2 = toRad(lat2);
  //   const Δφ = toRad(lat2 - lat1);
  //   const Δλ = toRad(lon2 - lon1);

  //   const a =
  //     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
  //     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  //   return R * c;
  // };

  const handleSearch = text => {
    setSearchQuery(text);
  };

  const selectDestination = place => {
    console.log(place);
    if (inputFocused === 'source') {
      setSourceSearch(place.name);
      setSource({
        name: place.name,
        coordinates: {lat: place.coordinates.lat, lon: place.coordinates.lon},
      });
    } else if (inputFocused === 'destination') {
      setDestination(place);
      setShowSearchModal(false);
    }
    saveDestination(place);
  };

  const handleFocus = inputType => {
    setInputFocused(inputType);

    if (selectAll) {
      inputRef.current?.setNativeProps({
        selection: {start: 0, end: sourceSearch.length},
      });
    }
    setSelectAll(true);
  };

  const saveDestination = place => {
    const destRef = ref(
      database,
      `destinations/${userEmail.replace('.', ',')}/userDestinations`,
    );
    const newDestination = {
      name: place.name,
      coordinates: {lat: place.coordinates.lat, lon: place.coordinates.lon},
      createdAt: serverTimestamp(),
    };

    push(destRef, newDestination)
      .then(() => {
        console.log('Destination saved!');
      })
      .catch(error => {
        console.error('Error saving destination:', error);
      });
  };

  const sourceLat =
    source.name === 'Your current location'
      ? position[0]
      : source.coordinates.lat;
  const sourceLon =
    source.name === 'Your current location'
      ? position[1]
      : source.coordinates.lon;

  const destinationLat = destination
    ? destination?.coordinates?.lat
    : position[0];
  const destinationLon = destination
    ? destination?.coordinates?.lon
    : position[1];

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pedestrian Routing Map</title>
      <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
      <style>
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          var map = L.map('map', { zoomControl: false }).setView([${sourceLat}, ${sourceLon}], 13);
    
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);
    
          var routingURL = 'https://routing.openstreetmap.de/routed-${routingProfile}/route/v1/${routingProfile}/${sourceLon},${sourceLat};${destinationLon},${destinationLat}?overview=full&geometries=geojson&steps=true';
    
          fetch(routingURL)
            .then(response => response.json())
            .then(json => {
              if (json.routes && json.routes.length > 0) {
                var route = json.routes[0];
                var coordinates = route.geometry.coordinates;
                var polyline = L.polyline(coordinates.map(coord => [coord[1], coord[0]]), {color: '#00E0A7'}).addTo(map);
                map.fitBounds(polyline.getBounds());




                var sourceMarker = L.marker([${sourceLat}, ${sourceLon}]).addTo(map);
                var destinationMarker = L.marker([${destinationLat}, ${destinationLon}]).addTo(map);
                sourceMarker.openPopup();

                var steps = route.legs[0].steps;
                var firstStep = steps[0];

                var direction = firstStep.maneuver.modifier.toLowerCase()
                var instructionText = firstStep.name ? 
                \`Go \${direction} on \${firstStep.name}, continue for \${(firstStep.distance).toFixed(0)} meters\` :
                \`Proceed \${direction}, continue for \${(firstStep.distance).toFixed(0)} meters\`;

                var totalDistance = (route.distance / 1000).toFixed(2); 
                var totalDuration = (route.duration / 60).toFixed(0); 
                var totalDurationSeconds = route.duration;
    
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  instruction: instructionText,
                  distance: totalDistance,
                  time: totalDuration,
                  timeInSeconds:totalDurationSeconds,
                  steps:steps
                }));
              } else {
                console.error('No routes found.');
              }
            })
            .catch(error => console.error('Error fetching the routing data: ', error));
        });
      </script>
    </body>
    </html>
    `;

  const SourceDestinationDisplay = ({onStart, onExit}) => {
    const isDefaultLocation = source.name === 'Your current location';

    return (
      <View style={styles.sourceDestinationContainer}>
        <View style={styles.leftCont}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
            <Text style={styles.time}>{time}</Text>
            <Text> </Text>
            <Text style={{fontSize: 24, color: '#06634c'}}>min</Text>
          </View>
          <View style={styles.distTimeCont}>
            <Text style={styles.dist}>{dist} km</Text>
            <Text style={styles.dot}>.</Text>
            <Text style={styles.exptTime}>{formatTime}</Text>
          </View>
        </View>

        {(navigationStarted || isDefaultLocation) && (
          <TouchableOpacity
            onPress={navigationStarted || !isDefaultLocation ? onExit : onStart}
            style={[
              navigationStarted || !isDefaultLocation
                ? styles.exitButton
                : styles.startButton,
            ]}>
            <Text style={styles.exitButtonText}>
              {navigationStarted
                ? 'Exit'
                : !isDefaultLocation
                ? 'Exit Preview'
                : 'Start'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const resetSelection = () => {
    inputRef.current = null;
    setDestination(null);
    setSourceSearch('Your current location');
    setSearchQuery('');
    setSource({
      name: 'Your current location',
      coordinates: {lat: position[0], lon: position[1]},
    });
    setShowSearchModal(false);
    setNavigationStarted(false);
  };

  const onMessageReceived = event => {
    const message = event.nativeEvent.data;

    const data = JSON.parse(message);

    console.log(data, 'efb4');

    setMessage(data.instruction);
    setDist(data.distance);

    const currentTime = new Date();
    const arrivalTime = new Date(
      currentTime.getTime() + data.timeInSeconds * 1000,
    );
    const formattedArrivalTime = `${arrivalTime.getHours()}:${arrivalTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    setFormatTime(formattedArrivalTime);

    setTime(data.time);
  };

  const startNavigation = () => {
    setNavigationStarted(true);
    RNLocationManager.startUpdatingLocation();
  };

  const stopNavigation = () => {
    setNavigationStarted(false);
    RNLocationManager.stopUpdatingLocation();
    resetSelection();
  };

  const selectRoutingProfile = profile => {
    setRoutingProfile(profile);
  };

  return (
    <SafeAreaView style={styles.container}>
      {destination ? (
        <>
          {navigationStarted ? (
            <View style={styles.instructionView}>
              <Image
                style={styles.navigationImage}
                source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-direction-50.png')}
              />
              <Text style={styles.messageBar}>{message}</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.ExitPreviewArea}
                onPress={stopNavigation}>
                <Text style={styles.exitPreviewText}>Exit Preview</Text>
              </TouchableOpacity>
            </>
          )}
          <SourceDestinationDisplay
            onStart={startNavigation}
            onExit={stopNavigation}
          />
        </>
      ) : (
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setShowSearchModal(true)}>
          <TextInput
            style={styles.searchInput}
            onChangeText={() => {}}
            value={destination}
            placeholder="Search here"
            placeholderTextColor="black"
            editable={false}
          />
        </TouchableOpacity>
      )}

      <View style={styles.routingButtons}>
        <TouchableOpacity
          style={[
            styles.routingButton,
            routingProfile === 'foot' && styles.activeButton,
          ]}
          onPress={() => selectRoutingProfile('foot')}>
          {routingProfile == 'foot' ? (
            <Image
              style={styles.image}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-walking-50.png')}
            />
          ) : (
            <Image
              style={styles.image}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-walking-50-black.png')}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.routingButton,
            routingProfile === 'bike' && styles.activeButton,
          ]}
          onPress={() => selectRoutingProfile('bike')}>
          {routingProfile == 'bike' ? (
            <Image
              style={styles.image}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-bicycle-50.png')}
            />
          ) : (
            <>
              <Image
                style={styles.image}
                source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-bicycle-50-black.png')}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <WebView
        originWhitelist={['*']}
        source={{html: mapHtml}}
        style={styles.map}
        onMessage={onMessageReceived}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={showSearchModal}
        onRequestClose={() => setShowSearchModal(false)}>
        <SafeAreaView style={styles.modalView}>
          <TouchableOpacity
            onPress={() => {
              resetSelection();
              setShowSearchModal(false);
            }}
            style={styles.closeButton}>
            <Image
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-back-50.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View style={styles.iconInputContainer}>
            <Image
              style={[styles.image, styles.dotIcon]}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-dot-30.png')}
            />
            <TouchableOpacity style={styles.sourceDestSearch}>
              <TextInput
                ref={inputRef}
                onChangeText={text => {
                  setSourceSearch(text);
                  setSelectAll(false);
                }}
                style={styles.modalSearchInput}
                value={sourceSearch}
                onFocus={() => handleFocus('source')}
                placeholder="Enter Source"
                placeholderTextColor="black"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.iconInputContainer}>
            <Image
              style={[styles.image, styles.verticalIcon]}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-menu-vertical-30.png')}
            />
          </View>

          <View style={styles.iconInputContainer}>
            <Image
              style={[styles.image, styles.addressIcon]}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-address-50.png')}
            />
            <TouchableOpacity style={styles.sourceDestSearch}>
              <TextInput
                style={styles.modalSearchInput}
                onChangeText={handleSearch}
                value={searchQuery}
                onFocus={() => handleFocus('destination')}
                placeholder="Enter Destination"
                placeholderTextColor="black"
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: '80%',
              height: 2,
              backgroundColor: 'black',
              alignSelf: 'center',
              marginTop: '10%',
            }}></View>
          <View style={{marginTop: '15%'}}>
            {inputFocused == 'destination' && (
              <FlatList
                data={places.filter(place =>
                  place.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => selectDestination(item)}>
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            {inputFocused == 'source' && (
              <FlatList
                data={places.filter(place =>
                  place.name.toLowerCase().includes(sourceSearch.toLowerCase()),
                )}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => selectDestination(item)}>
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  map: {flex: 1},
  searchBar: {
    position: 'absolute',
    top: 20,
    width: '85%',
    left: '7.5%',
    borderRadius: 50,
    padding: 20,
    marginTop: '10%',
    backgroundColor: 'white',
    zIndex: 1000,
  },
  searchInput: {fontSize: 13},
  modalView: {marginTop: 22},
  modalSearchInput: {
    fontSize: 15,
    margin: 10,
    paddingLeft: 40,
    padding: 5,
  },
  closeButton: {marginLeft: 10, marginTop: 10},
  backIcon: {width: 24, height: 24},
  itemText: {padding: 10},
  toggleContainer: {
    position: 'absolute',
    top: 80,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 8,
  },
  toggleButton: {
    padding: 10,
  },
  toggleButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  sourceDestSearch: {
    width: '75%',
    height: 55,
    left: '70%',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: '8%',
    backgroundColor: 'white',
  },
  sourceDestinationContainer: {
    position: 'absolute',
    width: '90%',
    bottom: 0,
    height: '18%',
    left: '5%',
    right: 0,
    backgroundColor: '#fdfbfb',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 2,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sourceDestinationText: {
    fontSize: 16,
  },
  exitButton: {
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 30,
  },
  startButton: {
    padding: 15,
    backgroundColor: '#095de4',
    borderRadius: 30,
  },
  exitButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  exitPreviewText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: '29%',
  },
  image: {
    width: 25,
    height: 25,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dotIcon: {
    position: 'absolute',
    top: 44,
    left: 20,
    zIndex: 1,
  },
  verticalIcon: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1,
  },
  addressIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    top: 44,
  },

  messageBar: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: '8%',
  },
  instructionView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    marginTop: '12%',
    height: '10%',
    left: '2.5%',
    right: '2.5%',
    padding: 10,
    backgroundColor: '#06634c',
    borderRadius: 20,
    zIndex: 1000,
  },
  ExitPreviewArea: {
    flexDirection: 'row',
    alignItems: 'center',
    placeItems: 'center',
    position: 'absolute',
    top: 20,
    width: '70%',
    marginTop: '12%',
    height: '7%',
    left: '15%',
    right: '2.5%',
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 50,
    zIndex: 1000,
  },
  navigationImage: {
    width: 30,
    height: 30,
    marginLeft: '5%',
  },
  time: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#06634c',
  },
  distTimeCont: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '65%',
    marginTop: 12,
  },
  dist: {
    fontSize: 20,
    color: '#a8a6a6',
  },
  exptTime: {
    fontSize: 20,
    color: '#a8a6a6',
  },
  dot: {
    fontSize: 20,
    color: '#a8a6a6',
    marginTop: '-4%',
  },
  routingButton: {
    padding: 10,
    backgroundColor: 'white',
    marginHorizontal: 5,
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: '#00E0A7',
  },
  routingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: '20%',
    width: '100%',
    zIndex: 1000,
  },
});

export default MapScreen;
