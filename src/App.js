import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = "b9c4cfc5fb5c3c2c530f6714a8e9c89f"; // OpenWeather API anahtarınızı buraya ekleyin
    const cityName = "Ankara";

    // Belirli bir tarih aralığındaki hava durumu verilerini almak için API'ye istek gönderin
    axios
      .get(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`)
      .then((response) => {
        // API'den gelen hava durumu verilerini alın ve Kelvin'i Celsius'a çevirin
        const filteredData = response.data.list.filter((item) => {
          const date = new Date(item.dt_txt);
          return date >= new Date("2023-10-01") && date <= new Date("2023-10-05");
        });

        const dailyData = [];
        let currentDate = filteredData[0].dt_txt.split(" ")[0];
        let dailyTemperatureSum = 0;
        let dailyWindSum = 0;
        let dailyDataPointCount = 0;

        for (let i = 0; i < filteredData.length; i++) {
          const item = filteredData[i];
          const itemDate = item.dt_txt.split(" ")[0];

          if (currentDate === itemDate) {
            dailyTemperatureSum += item.main.temp - 273.15;
            dailyWindSum += item.wind.speed;
            dailyDataPointCount++;
          } else if (currentDate !== itemDate) {
            dailyData.push({
              dt_txt: currentDate,
              main: {
                temp: (dailyTemperatureSum / dailyDataPointCount).toFixed(2), // Günlük ortalama sıcaklık (Kelvin'den Celsius'a çevrildi)
              },
              wind: {
                speed: (dailyWindSum / dailyDataPointCount).toFixed(2), // Günlük ortalama rüzgar hızı
              },
            });

            currentDate = itemDate;
            dailyTemperatureSum = item.main.temp - 273.15;
            dailyWindSum = item.wind.speed;
            dailyDataPointCount = 1;
          }
        }

        setWeatherData(dailyData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API isteği sırasında hata oluştu:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>Ankara Hava Durumu (1 Ekim - 5 Ekim)</h1>
      {loading ? (
        <p>Veri yükleniyor...</p>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dt_txt" />
              <YAxis yAxisId="left" label={{ value: "Sıcaklık (°C)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Rüzgar Hızı (m/s)", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="main.temp"
                name="Sıcaklık (°C)"
                stroke="#8884d8"
                yAxisId="left"
              />
              <Line
                type="monotone"
                dataKey="wind.speed"
                name="Rüzgar Hızı (m/s)"
                stroke="#82ca9d"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
