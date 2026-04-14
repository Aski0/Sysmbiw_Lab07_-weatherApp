import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ImageBackground } from 'expo-image';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const LOTTIE_RAIN = require('../assets/lottie/rain.json');
const LOTTIE_SUNNY = require('../assets/lottie/sunny.json');

const BASE_URL = `https://api.openweathermap.org/data/2.5/`;
const O_W_KEY = '552486e9827174555562b5ea2504d016';
                          

type TMainWeather = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
};

type TWeather = {
  name: string;
  main: TMainWeather;
  weather: Array<
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  >;
};

type TGeoCoords = {
  lat: number;
  lon: number;
}

export type TWeatherForecast = {
  main: TMainWeather;
  dt: number;
};

const WeatherScreen = () => {
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<TGeoCoords>();
  const [errorMsg, setErrorMsg] = useState('');
  const [weather, setWeather] = useState<TWeather>();
  const [forecast, setForecast] = useState<TWeatherForecast[]>();

  const fetchWeather = async (signal?: AbortSignal) => {
  if (!location) return;

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${O_W_KEY}&units=metric`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`Weather request failed (${response.status})`);
    }

    const data = await response.json();
    setWeather(data);

    if (__DEV__) console.log('Current weather: ', data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return;
    const msg = 'Failed to fetch weather data.';
    setErrorMsg(msg);
    if (__DEV__) console.log(msg, error);
  }
};

const fetchForecast = async (signal?: AbortSignal) => {
  if (!location) return;

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${O_W_KEY}&units=metric`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`Forecast request failed (${response.status})`);
    }

    const data = await response.json();
    setForecast(data.list);

    if (__DEV__) console.log('Weather forecast: ', data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return;
    const msg = 'Failed to fetch weather forecast.';
    setErrorMsg(msg);
    if (__DEV__) console.log(msg, error);
  }
};

useEffect(() => {
  if (location) {
    const controller = new AbortController();
    fetchWeather(controller.signal);
    fetchForecast(controller.signal);

    return () => {
      controller.abort();
    };
  }
}, [location]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'No permissions for location service!';
        if (isMounted) setErrorMsg(msg);
        if (__DEV__) console.log(msg);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync(
          { accuracy: Location.Accuracy.Balanced });
        const coords: TGeoCoords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
        // const coords: TGeoCoords = { lat: 50.07559, lon: 19.99528 };
        if (isMounted) setLocation(coords);
        if (__DEV__) console.log('Location coords: ', coords);
      } catch (error) {
        const msg = 'Current location is unavailable. Make sure location services are enabled.';
        if (isMounted) setErrorMsg(msg);
        if (__DEV__) console.log(msg, error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);


  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!weather) { return <ActivityIndicator />; }
  

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.imgBackground]} />

      <View style={[styles.weatherParams, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.location}>{weather.name}</Text>
        <LottieView
          source={weather.weather[0].main === 'Rain' ? LOTTIE_RAIN : LOTTIE_SUNNY}
          style={styles.lottiePicture}
          loop
          autoPlay
        />
      </View>

      <StatusBar style="light" />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  location: {
    fontSize: 30,
    color: 'lightgray',
  },
  imgBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  weatherParams: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lottiePicture: {
    width: 150,
    aspectRatio: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: 'lightgray',
    textAlign: 'center',
  },
});

export default WeatherScreen;
