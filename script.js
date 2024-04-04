document.addEventListener('DOMContentLoaded', function () {

    const cities = [
        {name: 'Praha', lat: 50.0755, lon: 14.4378},
        {name: 'Brno (pole)', lat: 49.1951, lon: 16.6068},
        {name: 'Ostrava', lat: 49.8209, lon: 18.2625}
    ];
    const apiUrlTemplateCurrent = 'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true';
    const apiUrlTemplateHistory = (lat, lon, startDate, endDate) =>
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m`;

    async function fetchWeather() {
        document.getElementById('weather-info').innerHTML = '';
        for (const city of cities) {
            const apiUrlCurrent = apiUrlTemplateCurrent.replace('{lat}', city.lat).replace('{lon}', city.lon);
            const currentWeatherResponse = await fetch(apiUrlCurrent);
            const currentWeatherData = await currentWeatherResponse.json();

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            const apiUrlHistory = apiUrlTemplateHistory(city.lat, city.lon, formattedStartDate, formattedEndDate);
            const historyWeatherResponse = await fetch(apiUrlHistory);
            const historyWeatherData = await historyWeatherResponse.json();

            let weatherHTML = `
                <div class="city-weather col-md-4 text-center mb-4">
                    <h2>${city.name}</h2>
                    <p>Aktuální teplota: ${currentWeatherData.current_weather.temperature}°C</p>
                    <p>Historie</p>
                    <ul>
            `;

            if (historyWeatherData.hourly && historyWeatherData.hourly.temperature_2m) {
                let hourlyData = historyWeatherData.hourly;
                const validDataIndices = hourlyData.temperature_2m.reduce((acc, temp, index) => {
                    if (temp !== null && temp !== undefined) {
                        acc.push(index);
                    }
                    return acc;
                }, []);

                for (const index of validDataIndices) {
                    weatherHTML += `<li>Čas: ${hourlyData.time[index]} <br> Teplota: ${hourlyData.temperature_2m[index]}°C</li><br>`;
                }
            } else {
                weatherHTML += '<li>Historie gone</li>';
            }

            weatherHTML += '</ul></div>';
            document.getElementById('weather-info').innerHTML += weatherHTML;
        }
        document.getElementById('last-updated').textContent = 'Naposledy aktualizováno: ' + new Date().toLocaleTimeString();
    }

    document.getElementById('refresh-data').addEventListener('click', fetchWeather);
    setInterval(fetchWeather, 60000);
    fetchWeather();
});
