import {useState, useEffect} from 'react';
import {AppState} from 'react-native';
import {ref, set, push} from 'firebase/database';
import {useSelector} from 'react-redux';

import {database} from '../firebase/firebase';

const ScreenTime = () => {
  const [startTime, setStartTime] = useState(0);
  const userEmail = useSelector(state => state.user.userEmail);

  useEffect(() => {
    if (!userEmail) return;

    const handleAppStateChange = nextAppState => {
      console.log(nextAppState);
      if (nextAppState === 'active') {
        const start = Date.now();
        setStartTime(start);
      } else if (nextAppState === 'background' && startTime !== 0) {
        const end = Date.now();
        const duration = end - startTime;

        const sessionsRef = ref(
          database,
          `sessions/${userEmail.replace('.', ',')}`,
        );
        const newSessionRef = push(sessionsRef);
        const sessionData = {
          startTime,
          endTime: end,
          duration,
        };

        set(newSessionRef, sessionData);

        setStartTime(0);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [startTime, userEmail]);

  return null;
};

export default ScreenTime;
