const apiKey = "34eadb2f44a685109460eae812b38e47"; //Clé API générée

document.addEventListener("DOMContentLoaded", () => {
  const savedCities = JSON.parse(localStorage.getItem("cities")) || [];
  const cityList = document.getElementById("city-list");

  // Pour chaque ville sauvegardée, crée une option dans la liste déroulante
  savedCities.forEach((city) => {
    const option = document.createElement("option");
    option.textContent = city;
    cityList.appendChild(option);
  });

  // sélectionne la dernière ville et affiche ses informations météorologiques
  if (savedCities.length > 0) {
    document.getElementById("city").value = savedCities[savedCities.length - 1];
    getWeather(savedCities[savedCities.length - 1]);
  }

  cityList.addEventListener("change", (event) => {
    const selectedCity = event.target.value;
    getWeather(selectedCity);
  });
});

function checkEnter(event) {
  if (event.key === "Enter") {
    getWeather();
  }
}

// Obtenir les informations météorologiques d'une ville
async function getWeather(cityName) {
  const city = cityName || document.getElementById("city").value;
  if (!city) {
    alert("Please enter a city name");
    return;
  }
  // API
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "200") {
      saveCity(city);
      displayWeather(data);
    } else {
      alert("City not found");
    }
  } catch (error) {
    alert("Error fetching data");
  }
}

function saveCity(city) {
  let savedCities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!savedCities.includes(city)) {
    savedCities.push(city);
    localStorage.setItem("cities", JSON.stringify(savedCities));

    const cityList = document.getElementById("city-list");

    // Ajouter une nouvelle option à la fin du select
    const option = document.createElement("option");
    option.textContent = city;
    cityList.appendChild(option);

    // Sélectionner la nouvelle option ajoutée
    option.selected = true;
  }
}

function displayWeather(data) {
  const weatherInfo = document.getElementById("weather-info");
  weatherInfo.innerHTML = "";

  const cityName = data.city.name;

  // Regrouper les prévisions par date
  const dailyForecasts = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = [];
    }
    dailyForecasts[date].push(item);
  });

  //Créer un seul élément pour le nom de la ville
  const cityHeader = document.createElement("h2");
  cityHeader.textContent = cityName;
  weatherInfo.appendChild(cityHeader);

  // Afficher le temps pour les 5 prochains jours
  Object.keys(dailyForecasts)
    .slice(0, 5)
    .forEach((date) => {
      const dailyData = dailyForecasts[date];
      const averageTemp =
        dailyData.reduce((sum, item) => sum + item.main.temp, 0) /
        dailyData.length;
      const description = dailyData[0].weather[0].description;
      const humidity = dailyData[0].main.humidity;
      const windSpeed = dailyData[0].wind.speed;

      const formattedDate = formatDateToFrench(date);

      const dayDiv = document.createElement("div");
      dayDiv.className = "day-forecast";
      dayDiv.innerHTML = `
            <h3>${formattedDate}</h3>
            <p>Temperature: ${averageTemp.toFixed(1)}°C</p>
            <p>Weather: ${description}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
        `;
      weatherInfo.appendChild(dayDiv);
    });
}

// Formatage de dates
function formatDateToFrench(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}
