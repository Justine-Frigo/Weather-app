import {deleteHistory, handleDeleteSubmit } from './deleteHistory.js';
import { apiKey, unsplashApiKey} from './config.js';

window.deleteHistory = deleteHistory;
window.handleDeleteSubmit = handleDeleteSubmit;
window.getWeather = getWeather;
window.checkEnter = checkEnter;

// On récupère la clé cities du local storage sinon on la définit en tant que tableau vide si elle n'existe pas
document.addEventListener("DOMContentLoaded", () => {
  const savedCities = JSON.parse(localStorage.getItem("cities")) || [];
  const cityList = document.getElementById("city-list");

  // Pour chaque ville sauvegardée, créer une option dans la liste déroulante
  savedCities.forEach((city) => {
    const option = document.createElement("option");
    option.textContent = city;
    cityList.appendChild(option);
  });

  // Sélectionner la dernière ville et afficher ses informations météorologiques
  if (savedCities.length > 0) {
    document.getElementById("city").value = savedCities[savedCities.length - 1];
    getWeather(savedCities[savedCities.length - 1]);
  }

  // Dès qu'on change la valeur du select, on fait appel à l'api
  cityList.addEventListener("change", (event) => {
    const selectedCity = event.target.value;
    if (event.target.value != 'null') {
      getWeather(selectedCity);
    }
   
  });
});

// Permet d'appuyer sur Enter quand on cherche une ville
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
  const unsplashUrl = `https://api.unsplash.com/search/photos/?client_id=${unsplashApiKey}&page=1&query=${city}`

  try {

    // On récupère les données de l'api météo
    const response = await fetch(url);
    const data = await response.json();

    // On récupère les données de l'api d'unsplash
    const unsplashResponse = await fetch(unsplashUrl);
    const unsplashData = await unsplashResponse.json();


    if (data.cod === "200") {
      saveCity(city);
      displayWeather(data, unsplashData);
    } else {
      alert("City not found");
    }

  } catch (error) {
    alert("Error fetching data");
    console.error(error)
  }
}

// Sauvegarder les villes dans le local storage
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

// Icônes
// On ne peut pas utiliser de switch car on a besoin des else
function getWeatherImage(description) {
  description = description.toLowerCase();
  if (description.includes("clear")) {
    return "./assets/images/sun.svg";
  } else if (description.includes("rain")) {
    return "./assets/images/rain.svg";
  } else if (
    description.includes("storm") ||
    description.includes("thunderstorm")
  ) {
    return "./assets/images/storm.svg";
  } else if (description.includes("snow")) {
    return "./assets/images/snow.svg";
  } else {
    return "./assets/images/cloud-sun.svg";
  }
}

// Ajoute une classe aux icônes
function getWeatherImageClass(description) {
  description = description.toLowerCase();
  if (description.includes("clear")) {
    return "sun";
  } else if (description.includes("rain")) {
    return "rain";
  } else if (
    description.includes("storm") ||
    description.includes("thunderstorm")
  ) {
    return "storm";
  } else if (description.includes("snow")) {
    return "snow";
  } else {
    return "default";
  }
}

// Affiche la météo et les images des villes
function displayWeather(data, unsplashData) {
  const weatherInfo = document.getElementById("weather-info");
  weatherInfo.innerHTML = "";

  const cityName = data.city.name;

  let cityImgUrl;

  if(unsplashData.results.length > 0) {
    cityImgUrl = unsplashData ? unsplashData.results[0].urls.small : '';
  } else {
    cityImgUrl = './assets/images/borabora.jpg';
  }


  // Regrouper les prévisions par date
  const dailyForecasts = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = [];
    }
    dailyForecasts[date].push(item);
  });

  // Créer un seul élément pour le nom de la ville
  const cityContainer = document.createElement('article')
  cityContainer.className = 'app-header';
  const cityImg = document.createElement('img');
  cityImg.src = cityImgUrl;
  cityImg.className = 'city-img';
  const imgContainer = document.createElement('div');
  imgContainer.className = 'img-container';
  imgContainer.appendChild(cityImg);
  cityContainer.appendChild(imgContainer);
  const cityHeader = document.createElement("h2");
  
  cityHeader.textContent = cityName;
  cityContainer.appendChild(cityHeader)
  weatherInfo.appendChild(cityContainer);

  const cardsContainer = document.createElement("article");
  cardsContainer.className = "cards-container";
  weatherInfo.appendChild(cardsContainer);

  // Afficher le temps pour les 5 prochains jours
  Object.keys(dailyForecasts)
    .slice(0, 5)
    .forEach((date) => {
      const dailyData = dailyForecasts[date];

      // Calcul des températures minimales et maximales pour chaque jour
      const temps = dailyData.map(item => item.main.temp);
      const minTemp = Math.min(...temps); 
      const maxTemp = Math.max(...temps); 

      const description = dailyData[0].weather[0].description;
      const humidity = dailyData[0].main.humidity;
      const windSpeed = dailyData[0].wind.speed;

      const formattedDate = formatDateToEnglish(date);

      const weatherImage = getWeatherImage(description);

      const weatherImageClass = getWeatherImageClass(description);

      const dayDiv = document.createElement("div");
      dayDiv.className = "day-forecast";
      dayDiv.innerHTML = `
            <h3>${formattedDate}</h3>
            <p><img class="${weatherImageClass}" src="${weatherImage}" alt="${description}"></p>
            <div class="temperatures">
            <p class="min-temperature">Min: ${minTemp.toFixed(1)}°C</p>
            <p class="max-temperature">Max: ${maxTemp.toFixed(1)}°C</p>
          </div>
            <section class="infos">
              <p class="humidity"><img class="droplet" src="./assets/images/humidity.svg" alt="Humidity"> ${humidity}%</p>
              <p class="wind-speed"><img class="wind" src="./assets/images/wind.svg" alt="Wind Speed"> ${windSpeed} m/s</p>
           </section>
        `;
      cardsContainer.appendChild(dayDiv);
    });
}

// Formatage de dates
function formatDateToEnglish(date) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options);
}

