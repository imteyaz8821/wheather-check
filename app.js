const detectBtn = document.getElementById("detectBtn");
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const weatherPanel = document.getElementById("weatherPanel");
const statusMessage = document.getElementById("statusMessage");

const locationName = document.getElementById("locationName");
const conditionText = document.getElementById("conditionText");
const temperatureValue = document.getElementById("temperatureValue");
const feelsLikeValue = document.getElementById("feelsLikeValue");
const windValue = document.getElementById("windValue");
const humidityValue = document.getElementById("humidityValue");
const updatedValue = document.getElementById("updatedValue");
const forecastGrid = document.getElementById("forecastGrid");

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Strong rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm with hail"
};

function setStatus(message) {
  statusMessage.textContent = message;
}

function formatTime(isoTime) {
  return new Date(isoTime).toLocaleString([], {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short"
  });
}

function formatDay(dateText) {
  return new Date(dateText).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

async function fetchWeather(lat, lon, label) {
  const endpoint =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=auto&forecast_days=5";

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Unable to load weather data right now.");
  }

  const data = await response.json();
  renderWeather(data, label);
}

function renderWeather(data, label) {
  const current = data.current;
  const daily = data.daily;

  locationName.textContent = label;
  conditionText.textContent = weatherCodes[current.weather_code] || "Unknown weather";
  temperatureValue.textContent = Math.round(current.temperature_2m);
  feelsLikeValue.textContent = `${Math.round(current.apparent_temperature)} deg C`;
  windValue.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  humidityValue.textContent = `${current.relative_humidity_2m}%`;
  updatedValue.textContent = formatTime(current.time);

  forecastGrid.innerHTML = "";

  daily.time.forEach((date, index) => {
    const card = document.createElement("article");
    card.className = "forecast-item";
    const code = daily.weather_code[index];

    card.innerHTML = `
      <p class="forecast-day">${formatDay(date)}</p>
      <p class="forecast-condition">${weatherCodes[code] || "Unknown weather"}</p>
      <p class="forecast-temp">${Math.round(daily.temperature_2m_max[index])} / ${Math.round(daily.temperature_2m_min[index])} deg C</p>
    `;

    forecastGrid.appendChild(card);
  });

  weatherPanel.classList.remove("hidden");
  setStatus(`Showing weather for ${label}.`);
}

async function searchCity(city) {
  setStatus(`Searching weather for ${city}...`);

  const endpoint =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("City lookup failed. Please try again.");
  }

  const data = await response.json();
  const result = data.results && data.results[0];

  if (!result) {
    throw new Error("City not found. Try a different spelling.");
  }

  const label = [result.name, result.admin1, result.country].filter(Boolean).join(", ");
  await fetchWeather(result.latitude, result.longitude, label);
}

async function detectWeather() {
  if (!navigator.geolocation) {
    setStatus("This browser does not support geolocation. Search by city instead.");
    return;
  }

  setStatus("Requesting your location...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        setStatus("Loading weather for your current location...");
        await fetchWeather(latitude, longitude, "Your Current Location");
      } catch (error) {
        setStatus(error.message);
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setStatus("Location access was denied. You can still search for a city.");
        return;
      }

      setStatus("I couldn't read your location. Please try again or search by city.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
}

detectBtn.addEventListener("click", () => {
  detectWeather();
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    setStatus("Enter a city name first.");
    cityInput.focus();
    return;
  }

  try {
    await searchCity(city);
  } catch (error) {
    setStatus(error.message);
  }
});
