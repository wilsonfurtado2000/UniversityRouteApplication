import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

import {useSelector} from 'react-redux';
import {ref, get} from 'firebase/database';
import {database} from '../firebase/firebase';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import moment from 'moment';

const AnalyticsScreen = ({navigation}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{data: []}],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [topDestinations, setTopDestinations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeChip, setActiveChip] = useState(null);
  const userEmail = useSelector(state => state.user.userEmail);
  const screenWidth = Dimensions.get('window').width;
  const timeFilters = ['Day', 'Week'];
  const AnalyticsChip = [
    'Weekly Average Screen Time',

    'Top 3 Destinations',
    'Daily Average Screen Time',

    'Top Destination',
    'Total Screen Time',
  ];
  const [screenTimeStats, setScreenTimeStats] = useState({
    totalScreenTime: 0,
    weeklyAverage: 0,
    dailyAverage: 0,
  });

  useEffect(() => {
    const time = timeFilters[selectedIndex].toLowerCase();
    const fetchData = async () => {
      const placesRef = ref(
        database,
        `destinations/${userEmail.replace('.', ',')}/userDestinations`,
      );
      const snapshot = await get(placesRef);

      const counts = {};
      const destinationCounts = {};

      snapshot.forEach(childSnapshot => {
        const date = moment(childSnapshot.val().createdAt);

        const destination = childSnapshot.val().name;
        destinationCounts[destination] =
          (destinationCounts[destination] || 0) + 1;

        let key;
        switch (time) {
          case 'day':
            key = date.format('YYYY-MM-DD');
            break;
          case 'week':
            key = date.format('YYYY-') + 'W' + date.week();
            break;
        }
        counts[key] = (counts[key] || 0) + 1;
      });

      const sortedDestinations = Object.entries(destinationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(item => ({destination: item[0], count: item[1]}));

      setTopDestinations(sortedDestinations);

      if (Object.keys(counts).length === 0) {
        setChartData({
          labels: ['No data'],
          datasets: [{data: [0]}],
        });
        return;
      }

      let labels, dataPoints;

      if (time === 'day') {
        const startOfWeek = moment()
          .subtract(currentIndex * 7, 'days')
          .startOf('week');
        labels = Array.from({length: 7}, (_, i) =>
          startOfWeek.clone().add(i, 'days').format('ddd'),
        );
        const weekData = labels.map(day => {
          const dateKey = startOfWeek
            .clone()
            .add(labels.indexOf(day), 'days')
            .format('YYYY-MM-DD');
          return counts[dateKey] || 0;
        });
        dataPoints = weekData;
      } else if (time === 'week') {
        const startWeek = moment()
          .subtract(currentIndex * 3, 'weeks')
          .startOf('isoWeek');
        labels = Array.from({length: 3}, (_, i) =>
          startWeek.clone().add(i, 'weeks').format('YYYY-[W]WW'),
        );
        dataPoints = labels.map(week => {
          return counts[week] || 0;
        });
      }

      setChartData({
        labels: labels,
        datasets: [{data: dataPoints}],
      });
    };

    fetchData();
  }, [selectedIndex, userEmail, currentIndex]);

  useEffect(() => {
    const sanitizedEmail = userEmail.replace('.', ',');
    const sessionsRef = ref(database, `sessions/${sanitizedEmail}`);

    const fetchSessionsData = async () => {
      const snapshot = await get(sessionsRef);
      if (snapshot.exists()) {
        const sessions = snapshot.val();
        calculateScreenTimeStats(sessions);
      }
    };

    fetchSessionsData();
  }, [userEmail]);

  function calculateScreenTimeStats(sessions) {
    let totalScreenTime = 0;
    let dailySessions = {};
    let weeklySessions = {};

    Object.keys(sessions).forEach(key => {
      const {startTime, duration} = sessions[key];
      const startMoment = moment(startTime);
      const dateKey = startMoment.format('YYYY-MM-DD');
      const weekKey = startMoment.format('YYYY-[W]WW');

      totalScreenTime += duration;
      dailySessions[dateKey] = (dailySessions[dateKey] || 0) + duration;
      weeklySessions[weekKey] = (weeklySessions[weekKey] || 0) + duration;
    });

    const dailyAverage =
      Object.keys(dailySessions).length > 0
        ? totalScreenTime / Object.keys(dailySessions).length
        : 0;
    const weeklyAverage =
      Object.keys(weeklySessions).length > 0
        ? Object.values(weeklySessions).reduce((a, b) => a + b, 0) /
          Object.keys(weeklySessions).length
        : 0;

    setScreenTimeStats({
      totalScreenTime,
      weeklyAverage,
      dailyAverage,
    });
  }

  function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = '';
    if (hrs > 0) {
      result += `${hrs}h `;
    }
    if (mins > 0 || hrs > 0) {
      result += `${mins}min `;
    }
    result += `${secs.toFixed(0)}sec`;

    return result.trim();
  }

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  const handleChipClick = chip => {
    setActiveChip(chip === activeChip ? null : chip);
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#00E0A7',
    },
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#00E0A7',
      }}>
      <View
        style={{
          backgroundColor: '#00E0A7',
          height: '20%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={navigateBack}
          style={{position: 'absolute', left: 20, top: 10}}>
          <Image
            style={{width: 25, height: 25}}
            source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-left-24.png')}
          />
        </TouchableOpacity>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white'}}>
          Analytics
        </Text>
      </View>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: 'white',
          height: '80%',
          paddingHorizontal: 40,
          paddingTop: 20,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
        contentContainerStyle={{paddingBottom: 50}}>
        <SegmentedControlTab
          values={timeFilters}
          selectedIndex={selectedIndex}
          onTabPress={setSelectedIndex}
          tabsContainerStyle={{
            marginBottom: 20,
            marginLeft: -5,
            backgroundColor: '#F5F5F5',
            borderRadius: 10,
          }}
          tabStyle={{
            borderColor: '#F5F5F5',
            paddingVertical: 10,
            minWidth: 90,
            paddingHorizontal: 12,
            backgroundColor: '#F5F5F5',
            borderRadius: 10,
          }}
          activeTabStyle={{backgroundColor: '#00E0A7', borderRadius: 10}}
          tabTextStyle={{color: '#A5A5A5', fontWeight: 'bold', fontSize: 14}}
          activeTabTextStyle={{color: '#FFFFFF'}}
        />
        <LineChart
          data={chartData}
          width={screenWidth - 80}
          height={220}
          chartConfig={chartConfig}
          bezier
        />

        {selectedIndex === 0 && (
          <Text
            style={{textAlign: 'center', marginTop: 10, fontWeight: 'bold'}}>
            {`Week ${moment()
              .subtract(currentIndex * 7, 'days')
              .week()} - ${moment()
              .subtract(currentIndex * 7, 'days')
              .year()}`}
          </Text>
        )}

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentIndex === 0}
            style={[
              {
                padding: 10,
                marginHorizontal: 10,
              },
              {opacity: currentIndex === 0 ? 0.5 : 1},
            ]}>
            <Image
              style={{width: 25, height: 25}}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-sort-left-50.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={{padding: 10, marginHorizontal: 10}}>
            <Image
              style={{width: 25, height: 25}}
              source={require('/Users/wilsonfurtado/UniversityRoute/assests/images/icons8-sort-right-50.png')}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            {
              height: 1,
              backgroundColor: 'black',
              width: '100%',
              marginVertical: 5,
            },
            {marginTop: 50},
          ]}></View>

        <View
          style={{
            marginTop: '20%',
            marginBottom: '15%',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          {AnalyticsChip.map(chip => (
            <TouchableOpacity
              key={chip}
              style={[
                {
                  width: 'auto',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#ccc',
                  margin: 5,
                },
                {backgroundColor: activeChip === chip ? '#00E0A7' : '#ccc'},
              ]}
              onPress={() => handleChipClick(chip)}>
              <Text style={{fontSize: 10, fontWeight: 'bold', color: 'white'}}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{alignItems: 'center'}}>
          {activeChip === 'Total Screen Time' && (
            <>
              <Text style={{fontSize: 18, paddingTop: 5}}>
                Total Screen Time
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: 'black',
                  width: '100%',
                  marginVertical: 5,
                }}></View>

              <Text style={{fontSize: 18, paddingTop: 5}}>
                {formatDuration(screenTimeStats.totalScreenTime / 1000)}
              </Text>
            </>
          )}
          {activeChip === 'Weekly Average Screen Time' && (
            <>
              <Text style={{fontSize: 18, paddingTop: 5}}>
                Weekly Average Screen Time
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: 'black',
                  width: '100%',
                  marginVertical: 5,
                }}></View>

              <Text style={{fontSize: 18, paddingTop: 5}}>
                {formatDuration(screenTimeStats.weeklyAverage / 1000)}
              </Text>
            </>
          )}
          {activeChip === 'Daily Average Screen Time' && (
            <>
              <Text style={{fontSize: 18, paddingTop: 5}}>
                Daily Average Screen Time{' '}
              </Text>

              <View
                style={{
                  height: 1,
                  backgroundColor: 'black',
                  width: '100%',
                  marginVertical: 5,
                }}></View>
              <Text style={{fontSize: 18, paddingTop: 5}}>
                {formatDuration(screenTimeStats.dailyAverage / 1000)}
              </Text>
            </>
          )}

          {activeChip === 'Top 3 Destinations' &&
            topDestinations.slice(0, 3).map((item, index) => (
              <>
                <Text style={{fontSize: 18, paddingTop: 5}} key={index}>
                  {item.destination}
                </Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: 'black',
                    width: '100%',
                    marginVertical: 5,
                  }}></View>
              </>
            ))}
          {activeChip === 'Top Destination' &&
            topDestinations.slice(0, 1).map((item, index) => (
              <>
                <Text style={{fontSize: 18, paddingTop: 5}} key={index}>
                  {item.destination}
                </Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: 'black',
                    width: '100%',
                    marginVertical: 5,
                  }}></View>
              </>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default AnalyticsScreen;
