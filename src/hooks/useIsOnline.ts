import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Fetch current state immediately so the initial render is accurate
    NetInfo.fetch()
      .then((state) => {
        setIsOnline(state.isConnected ?? true);
      })
      // Assume online if the probe fails: the addEventListener below will
      // correct us, and a false "offline" blocks every mutation in the app.
      .catch(() => setIsOnline(true));

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}
