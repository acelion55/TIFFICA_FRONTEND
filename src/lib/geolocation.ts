import { Geolocation } from '@capacitor/geolocation';

export async function getCurrentLocation() {
  try {
    const coordinates = await Geolocation.getCurrentPosition();
    return {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      accuracy: coordinates.coords.accuracy,
      timestamp: coordinates.timestamp,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

export async function watchLocation(
  callback: (location: any) => void,
  errorCallback?: (error: any) => void
) {
  try {
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000,
      },
      (position) => {
        if (position) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        }
      }
    );

    return watchId;
  } catch (error) {
    console.error('Error watching location:', error);
    if (errorCallback) {
      errorCallback(error);
    }
    throw error;
  }
}

export async function clearWatch(watchId: string) {
  try {
    await Geolocation.clearWatch({ id: watchId });
  } catch (error) {
    console.error('Error clearing watch:', error);
  }
}
