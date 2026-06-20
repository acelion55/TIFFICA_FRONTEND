export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

export async function watchLocation(
  callback: (location: any) => void,
  errorCallback?: (error: any) => void
) {
  if (!navigator.geolocation) {
    if (errorCallback) errorCallback(new Error('Geolocation not supported'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error('Error watching location:', error);
      if (errorCallback) errorCallback(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000,
    }
  );

  return watchId.toString();
}

export async function clearWatch(watchId: string) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(parseInt(watchId));
  }
}
