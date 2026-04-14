import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TextInput, TouchableOpacity, Keyboard, Alert } from 'react-native';
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
  dt_txt?: string;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
};

const WeatherScreen = () => {
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<TGeoCoords>();
  const [errorMsg, setErrorMsg] = useState('');
  const [weather, setWeather] = useState<TWeather>();
  const [forecast, setForecast] = useState<TWeatherForecast[]>();
  const [inputLat, setInputLat] = useState('');
  const [inputLon, setInputLon] = useState('');
  const [inputCity, setInputCity] = useState('');

const handleSearch = () => {
    const lat = parseFloat(inputLat.replace(',', '.'));
    const lon = parseFloat(inputLon.replace(',', '.'));

    if (!isNaN(lat) && !isNaN(lon)) {
      setLocation({ lat, lon });
      Keyboard.dismiss();
      setInputLat('');
      setInputLon('');
    } else {
      Alert.alert("Błąd", "Wprowadź poprawne współrzędne liczbowe.");
    }
  };

  const handleCitySearch = async () => {
    if (!inputCity.trim()) return; // Jeśli pole jest puste, nic nie rób

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${inputCity}&limit=1&appid=${O_W_KEY}`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // API zwróciło wyniki, pobieramy lat i lon z pierwszego dopasowania
        setLocation({ lat: data[0].lat, lon: data[0].lon });
        Keyboard.dismiss(); // Chowa klawiaturę
        setInputCity(''); // Czyści pole wyszukiwania po sukcesie
      } else {
        Alert.alert("Błąd", "Nie znaleziono miejscowości o podanej nazwie.");
      }
    } catch (error) {
      Alert.alert("Błąd sieci", "Nie udało się pobrać danych lokalizacji.");
      if (__DEV__) console.log('Geocoding error: ', error);
    }
  };

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

      <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Wpisz nazwę miasta..."
            placeholderTextColor="#aaa"
            value={inputCity}
            onChangeText={setInputCity}
            onSubmitEditing={handleCitySearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleCitySearch}>
            <Text style={styles.searchButtonText}>Szukaj</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Szerokość (Lat)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={inputLat}
            onChangeText={setInputLat}
          />
          <TextInput
            style={styles.input}
            placeholder="Długość (Lon)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={inputLon}
            onChangeText={setInputLon}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Szukaj</Text>
          </TouchableOpacity>
        </View>


        <Text style={styles.location}>{weather.name}</Text>

        <LottieView
          source={weather.weather[0].main === 'Rain' ? LOTTIE_RAIN : LOTTIE_SUNNY}
          style={styles.lottiePicture}
          loop
          autoPlay
        />
        <Text style={styles.description}>{weather.weather[0].description}</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.tempText}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.detailsText}>Odczuwalna: {Math.round(weather.main.feels_like)}°C</Text>
          <Text style={styles.detailsText}>Ciśnienie: {weather.main.pressure} hPa</Text>
          <Text style={styles.detailsText}>Wilgotność: {weather.main.humidity}%</Text>
        </View>

        {forecast && (
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>PROGNOZA (5 dni)</Text>
            <FlatList
              horizontal
              data={forecast}
              keyExtractor={(item) => item.dt.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const date = new Date(item.dt * 1000);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                
                // Tablica z dniami tygodnia w języku polskim
                const daysPL = ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'];
                const dayOfWeek = daysPL[date.getDay()]; // getDay() zwraca numer od 0 (niedziela) do 6 (sobota)

                return (
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastDate}>{dayOfWeek} {day}.{month}</Text>
                    <Text style={styles.forecastTime}>{hours}:{minutes}</Text>
                    <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                    <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
                    <Text style={styles.forecastHumidity}>💧 {item.main.humidity}%</Text>
                  </View>
                );
              }}
            />
          </View>
        )}

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
  description: {
    fontSize: 22,
    color: 'white',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    marginBottom: 20,
  },
  tempText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 18,
    color: 'lightgray',
    marginVertical: 4,
  },
  forecastContainer: {
    width: '100%',
    marginTop: 10,
    height: 190,
  },
  forecastTitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
    color: 'white',
    fontWeight: 'ultralight',
    marginBottom: 10,
  },
  forecastItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  forecastDate: {
    color: 'lightgray',
    fontSize: 12,
    marginBottom: 2,
  },
  forecastTime: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastTemp: {
    color: '#f0ae35f1',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  searchButton: {
    backgroundColor: '#f0ae35f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    marginLeft: 5,
  },
  searchButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  orText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  forecastDesc: {
    color: 'lightgray',
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 5,
    textAlign: 'center',
  },
  forecastHumidity: {
    color: '#87CEFA',
    fontSize: 14,
    marginTop: 5,
    fontWeight: 'bold',
  },
});

export default WeatherScreen;
