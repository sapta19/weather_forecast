import React, { useState, useEffect } from 'react';
import './App.css';
import DailyCard from './DailyCard';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import sunnyIcon from '../images/sun.png'
import rainyIcon from '../images/rain.png';
import thunderIcon from '../images/storm.png';

function App() {
  const [location, setLocation] = useState({ lat: null, long: null });
  const [dailyData, setDailyData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [city, setCity] = useState('Your location');
  

  function getWeatherIcon(weather) {
    switch (weather.toLowerCase()) {
      case 'sunny':
        return sunnyIcon;
      case 'rainy':
        return rainyIcon;
      case 'thunder':
        return thunderIcon;
      default:
        return ''; // Default icon or placeholder image
    }
  }
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const long = position.coords.longitude;
      setLocation({ lat, long });

      // Reverse Geocoding to get the location name
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    try {
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      if (geoData && geoData.address) {
        const cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.hamlet || geoData.address.county || geoData.address.state || geoData.address.country;
        setCity(cityName);
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }


      const dailyParams = {
        latitude: lat,
        longitude: long,
        daily: 'temperature_2m_max,temperature_2m_min,windspeed_10m_max,uv_index_max,sunrise,sunset',
        timezone: 'auto'
      };

      const currentParams = {
        latitude: lat,
        longitude: long,
        current_weather: true
      };

      const dailyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${dailyParams.latitude}&longitude=${dailyParams.longitude}&daily=${dailyParams.daily}&timezone=${dailyParams.timezone}`;
      const currentUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentParams.latitude}&longitude=${currentParams.longitude}&current_weather=${currentParams.current_weather}`;

      try {
        const [dailyResponse, currentResponse] = await Promise.all([
          fetch(dailyUrl),
          fetch(currentUrl),
        ]);

        const dailyData = await dailyResponse.json();
        const currentData = await currentResponse.json();

        if (dailyData && dailyData.daily) {
          const processedDailyData = dailyData.daily.time.map((time, index) => ({
            date: time,
            maxTemp: dailyData.daily.temperature_2m_max[index],
            minTemp: dailyData.daily.temperature_2m_min[index],
            maxWindSpeed: dailyData.daily.windspeed_10m_max[index],
            uvIndex: dailyData.daily.uv_index_max[index],
            sunrise: dailyData.daily.sunrise[index],
            sunset: dailyData.daily.sunset[index],
            humidity: Math.floor(Math.random() * 100) // Random humidity value for illustration
          }));
          setDailyData(processedDailyData);
        }

        if (currentData && currentData.current_weather) {
          setCurrentData({
            temperature: currentData.current_weather.temperature,
            windSpeed: currentData.current_weather.windspeed,
            windDirection: currentData.current_weather.winddirection,
            humidity: Math.floor(Math.random() * 100), // Random humidity value for illustration
            pressure: 1013 // Static pressure value for illustration
          });
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    });
  }, []);

  const chartData = {
    labels: dailyData.map(day => new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Max Temperature (°C)',
        data: dailyData.map(day => day.maxTemp),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Min Temperature (°C)',
        data: dailyData.map(day => day.minTemp),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };
  return (
    <div className="app">
      <div className="weather-header">
        <div>
          <label>Your city</label>
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
          />
        </div>
        <div className="current-time">
          <p>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="main-content">
      <div className="current-conditions card">
  {currentData.temperature !== undefined ? (
    <>
      <div className="temperature">
        <img src={getWeatherIcon('sunny')} alt="Weather icon" width={200} height={200}/>
        <h1>{currentData.temperature}°C</h1>
        <p>{city}</p>
      </div>
      <div className="weather-details">
        <p>{currentData.weather}</p>
        <p>Humidity: {currentData.humidity}%</p>
        <p>Wind speed: {currentData.windSpeed} km/h</p>
      </div>
    </>
  ) : (
    <p>Loading current conditions...</p>
  )}
</div>
        <div className="forecast-and-chart">
          <div className="chart card">
            {dailyData.length > 0 ? (
              <Line data={chartData} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
          <div className="daily-forecast card">
            <h2>Daily Forecast</h2>
            {dailyData.length > 0 ? (
              <div className="daily-forecast-cards">
                {dailyData.map((day, index) => (
                  <DailyCard key={index} day={day} />
                ))}
              </div>
            ) : (
              <p>Loading daily forecast...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default App;
