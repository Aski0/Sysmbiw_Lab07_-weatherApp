# Lab 07 - Use of Weather API in React Native

**Author**: `Write here your Name and Surname`
**Team**: `Write your team - example K01`

## Description

A React Native / Expo application that displays current weather conditions for the user's physical location. The app requests device location permission, fetches weather data from the [OpenWeatherMap API](https://openweathermap.org/api), and renders an animated weather icon (Lottie) over a full-screen background image.

Key features:

- Foreground GPS location via `expo-location`
- Current weather fetch from OpenWeatherMap (`/weather` endpoint)
- Lottie animations for weather conditions (rain / sunny)
- Safe area handling on both iOS and Android via `react-native-safe-area-context`
- Optimized images via `expo-image`
- Error state displayed when location permission is denied or unavailable

## Starting structure

```text
Lab7_start/
├── assets/
│   ├── background.jpg          # Full-screen weather background image
│   ├── icon.png                # App icon
│   ├── adaptive-icon.png       # Android adaptive icon
│   ├── splash-icon.png         # Splash screen icon
│   ├── favicon.png             # Web favicon
│   └── lottie/
│       ├── rain.json           # Lottie animation — rain
│       └── sunny.json          # Lottie animation — sunny/default
├── components/
│   └── WeatherScreen.tsx       # Main screen: location, weather fetch, animated UI
├── App.tsx                     # Root component with SafeAreaProvider
├── index.ts                    # Expo entry point (registerRootComponent)
├── app.json                    # Expo configuration (New Architecture enabled)
├── package.json
└── tsconfig.json               # Strict TypeScript
```

## Tech stack

| Package | Version | Purpose |
| --- | --- | --- |
| `expo` | ~55.0.9 | Managed workflow |
| `react-native` | 0.83.4 | Mobile framework (New Architecture) |
| `react` | 19.2.0 | UI library |
| `expo-location` | ~55.1.4 | GPS coordinates |
| `expo-image` | ~2.1.8 | Optimized image rendering |
| `expo-status-bar` | ~55.0.4 | Status bar control |
| `lottie-react-native` | ~7.3.4 | Vector animations |
| `react-native-safe-area-context` | ~5.4.0 | Notch / home indicator insets |
| `expo-blur` | ~55.0.10 | Blur effects (available) |

## Setup

1. Install dependencies:

   ```shell
   npm install
   ```

2. Add your OpenWeatherMap API key in `components/WeatherScreen.tsx`:

   ```ts
   const O_W_KEY = 'your_api_key_here';
   ```

3. Start the development server:

   ```shell
   npx expo start
   ```

4. Run on device or emulator:

   ```shell
   npx expo start --android
   npx expo start --ios
   ```

> Location permission must be granted on the device for weather data to load.
