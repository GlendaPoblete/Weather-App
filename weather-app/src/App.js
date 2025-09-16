import React, { useEffect, useState } from 'react';
import WeatherCard from './components/WeatherCard';
import './App.css';

console.log('API KEY from env:', process.env.REACT_APP_OWM_API_KEY);

const INITIAL_CITIES = ['Manila', 'Bern', 'Delhi', 'Lilongwe', 'Islamabad'];
const API_KEY = process.env.REACT_APP_OWM_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ASYNC FETCH FUNCTION
async function fetchWeatherData(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const j = await response.json();
        if (j?.message) {
          msg = j.message.charAt(0).toUpperCase() + j.message.slice(1);
          if (!msg.endsWith('.')) msg += '.';
        }
      } catch {}
      throw new Error(msg);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export default function App() {
  // SEPARATE STATES
  const [defaultCities, setDefaultCities] = useState(INITIAL_CITIES);
  const [defaultWeather, setDefaultWeather] = useState({});
  
  // FETCH WEATHER FOR DEFAULT CITY
  function loadDefaultCityWeather(city) {
    const key = city.toLowerCase();
    setDefaultWeather((m) => ({ ...m, [key]: { status: 'loading' } }));
    fetchWeatherData(city)
      .then((data) =>
        setDefaultWeather((m) => ({ ...m, [key]: { status: 'ready', data } }))
      )
     .catch((err) =>
        setDefaultWeather((m) => ({ ...m, [key]: { status: 'error', error: err.message } }))
      );
  }

  // LOAD DEFAULT CITIES
  useEffect(() => {
    defaultCities.forEach((c) => loadDefaultCityWeather(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EDIT DEFAULT CITIES
  function handleEditCity(index, newName) {
    const updated = [...defaultCities];
    updated[index] = newName;
    setDefaultCities(updated);
    if (newName.trim()) loadDefaultCityWeather(newName);
  }

  
  return (
    <div className="container">
      <header className="header">
        <h1>GRL Weather Checker 🌦️</h1>
        <p className="subtitle">
          Current conditions powered by OpenWeatherMap
        </p>
      </header>

      {/* DEFAULT WEATHER CARDS */}
      <main className="grid">
        {defaultCities.map((c) => {
          const key = c.toLowerCase();
          const entry = defaultWeather[key];
          return (
            <WeatherCard
              key={key}
              cityLabel={c}
              status={entry?.status || 'loading'}
              data={entry?.data}
              error={entry?.error}
            />
          );
        })}
      </main>

      {/* EDITABLE DEFAULT WEATHER CITIES */}
      <div className="edit-cities">
        {defaultCities.map((city, index) => (
          <input
            key={index}
            className="city-edit-input"
            value={city}
            onChange={(e) => handleEditCity(index, e.target.value)}
          />
        ))}
     </div>
     </div>
  );
}