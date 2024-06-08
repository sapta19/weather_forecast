import React from 'react';
import './DailyCard.css';

export default function DailyCard({ day }) {
  const {
    date,
    maxTemp,
    minTemp,
    maxWindSpeed,
    uvIndex,
    sunrise,
    sunset,
    humidity
  } = day;

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  return (
    <div className="daily-card">
      <p>{formattedDate}</p>
      <p>{maxTemp}°C</p>
      <p>Humidity: {humidity}%</p>
    </div>
  );
}
