document.addEventListener("DOMContentLoaded", () => {
  const apiKey = config.OPENWEATHERMAP_API_KEY;
  const input = document.getElementById("user_location");
  const converter = document.getElementById("converter");
  const searchIcon = document.querySelector(".fa-search");

  const findUserLocation = async () => {
    const location = input.value;
    const unit = converter.value === "°C" ? "metric" : "imperial";
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${apiKey}`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${apiKey}`;

    const weatherContent = document.querySelector(".weather_content");
    weatherContent.style.opacity = 0;
    weatherContent.classList.remove("slide-right");

    try {
      const weatherResponse = await fetch(weatherApiUrl);
      const weatherData = await weatherResponse.json();
      updateWeather(weatherData);

      const { lat, lon } = weatherData.coord;
      const uvApiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const uvResponse = await fetch(uvApiUrl);
      const uvData = await uvResponse.json();
      updateUVIndex(uvData);

      const forecastResponse = await fetch(forecastApiUrl);
      const forecastData = await forecastResponse.json();
      updateForecast(forecastData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }

    setTimeout(() => {
      weatherContent.style.opacity = 1;
      weatherContent.classList.add("slide-right");
    }, 0);
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const unit = converter.value === "°C" ? "metric" : "imperial";
          const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
          const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;

          const weatherContent = document.querySelector(".weather_content");
          weatherContent.style.opacity = 0;
          weatherContent.classList.remove("slide-right");

          try {
            const weatherResponse = await fetch(weatherApiUrl);
            const weatherData = await weatherResponse.json();
            updateWeather(weatherData);

            const uvApiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            const uvResponse = await fetch(uvApiUrl);
            const uvData = await uvResponse.json();
            updateUVIndex(uvData);

            const forecastResponse = await fetch(forecastApiUrl);
            const forecastData = await forecastResponse.json();
            updateForecast(forecastData);
          } catch (error) {
            console.error("Error fetching weather data:", error);
          }

          setTimeout(() => {
            weatherContent.style.opacity = 1;
            weatherContent.classList.add("slide-right");
          }, 0);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const updateWeather = (data) => {
    document.querySelector(
      ".temprature"
    ).innerText = `${data.main.temp} ${converter.value}`;
    document.querySelector(
      ".feelslike"
    ).innerText = `Feels like: ${data.main.feels_like} ${converter.value}`;
    document.querySelector(".discription").innerText =
      data.weather[0].description;
    document.querySelector(".date").innerText = new Date().toLocaleDateString();
    document.querySelector(".city").innerText = data.name;
    document.getElementById("Hvalue").innerText = `${data.main.humidity}%`;
    document.getElementById("Wvalue").innerText = `${data.wind.speed} m/s`;
    document.getElementById("Cvalue").innerText = `${data.clouds.all}%`;
    document.getElementById("Pvalue").innerText = `${data.main.pressure} hPa`;
    document.getElementById("SRvalue").innerText = new Date(
      data.sys.sunrise * 1000
    ).toLocaleTimeString();
    document.getElementById("SSvalue").innerText = new Date(
      data.sys.sunset * 1000
    ).toLocaleTimeString();

    const weatherIcon = document.querySelector(".weather_icon");
    const iconCode = data.weather[0].icon;
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">`;

    const weatherBg = document.querySelector(".weather-bg");
    const weatherCondition = data.weather[0].main.toLowerCase();
    updateBackground(weatherBg, weatherCondition);
  };

  const updateUVIndex = (data) => {
    document.getElementById("UVvalue").innerText = data.value;
  };

  const updateForecast = (data) => {
    const forecastElement = document.querySelector(".forecast");
    forecastElement.innerHTML = "";

    const dailyData = [];
    const seenDates = new Set();

    data.list.forEach((entry) => {
      const dateObj = new Date(entry.dt * 1000);
      const dateString = dateObj.toISOString().split("T")[0];

      if (!seenDates.has(dateString)) {
        dailyData.push(entry);
        seenDates.add(dateString);
      }
    });

    dailyData.slice(0, 7).forEach((day) => {
      const dateObj = new Date(day.dt * 1000);
      const date = dateObj.toLocaleDateString();
      const dayName = dateObj.toLocaleDateString(undefined, {
        weekday: "long",
      });
      const iconCode = day.weather[0].icon;
      const temp = day.main.temp;
      const description = day.weather[0].description;

      const dayElement = document.createElement("div");
      dayElement.classList.add(
        "forecast-day",
        "rounded-2xl",
        "p-4",
        "hover:scale-[98%]",
        "hover:ease-in-out",
        "hover:duration-300"
      );

      dayElement.innerHTML = `
        <div class="date">${dayName}, ${date}</div>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">
        <div class="temp">${temp} ${converter.value}</div>
        <div class="description">${description}</div>
      `;

      forecastElement.appendChild(dayElement);
    });
  };

  const updateBackground = (element, condition) => {
    const backgrounds = {
      clear: "url('/build/assets/images/sunny.jpg')",
      clouds: "url('/build/assets/images/cloudy.jpg')",
      rain: "url('/build/assets/images/rainny.jpg')",
      snow: "url('/build/assets/images/snow.jpg')",
      thunderstorm: "url('/build/assets/images/thunder1.jpg')",
      drizzle: "url('/build/assets/images/drizzle.jpg')",
      mist: "url('/build/assets/images/mist.jpg')",
    };

    element.style.backgroundImage =
      backgrounds[condition] || "url('/build/assets/images/w.jpg')";
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundTransition = "ease-in-out";
  };

  searchIcon.addEventListener("click", findUserLocation);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      findUserLocation();
    }
  });

  document
    .querySelector(".current_location")
    .addEventListener("click", getCurrentLocationWeather);
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".weather_output").classList.add("slide-left");
});
