const apiKey = '34eadb2f44a685109460eae812b38e47';

document.addEventListener('DOMContentLoaded', () => {
    const savedCities = JSON.parse(localStorage.getItem('cities')) || [];
    const cityList = document.getElementById('city-list');

    savedCities.forEach(city => {
        const cityItem = document.createElement('li');
        cityItem.textContent = city;
        cityItem.onclick = () => getWeather(city);
        cityList.appendChild(cityItem);
    });

    if (savedCities.length > 0) {
        document.getElementById('city').value = savedCities[savedCities.length - 1];
        getWeather(savedCities[savedCities.length - 1]);
    }
});

function checkEnter(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
}

async function getWeather(cityName) {
    const city = cityName || document.getElementById('city').value;
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === '200') {
            saveCity(city);
            displayWeather(data);
        } else {
            alert('City not found');
        }
    } catch (error) {
        alert('Error fetching data');
    }
}

function saveCity(city) {
    let savedCities = JSON.parse(localStorage.getItem('cities')) || [];
    if (!savedCities.includes(city)) {
        savedCities.push(city);
        localStorage.setItem('cities', JSON.stringify(savedCities));

        const cityList = document.getElementById('city-list');
        const cityItem = document.createElement('li');
        cityItem.textContent = city;
        cityItem.onclick = () => getWeather(city);
        cityList.appendChild(cityItem);
    }
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = '';

    const cityName = data.city.name;

    // Group the forecasts by date
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
    });

    //Créer un seul élément pour le nom de la ville
    const cityHeader = document.createElement('h2');
    cityHeader.textContent = cityName;
    weatherInfo.appendChild(cityHeader);

    // Display the weather for the next 5 days
    Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
        const dailyData = dailyForecasts[date];
        const averageTemp = dailyData.reduce((sum, item) => sum + item.main.temp, 0) / dailyData.length;
        const description = dailyData[0].weather[0].description;
        const humidity = dailyData[0].main.humidity;
        const windSpeed = dailyData[0].wind.speed;

        const formattedDate = formatDateToFrench(date);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-forecast';
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

function formatDateToFrench(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
}
