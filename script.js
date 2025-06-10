const timeElement = document.querySelector(".time");
        const weatherElement = document.querySelector(".weather");
        const greetingElement = document.querySelector('.txt');
        const dynamicBackground = document.getElementById('dynamic-background');
        const weatherEffectsContainer = document.getElementById('weather-effects');

        const apiKey = '3608f4f2b24ac7fff9ffe24fa3bc4cdf'; 


        const fahrenheitCountries = ['US', 'LR', 'MM']; // Countries where temperature is typically shown in Fahrenheit

        // Function to update time and greeting
        function updateGreetTime() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours < 12 ? 'AM' : 'PM';
            const hour12 = hours % 12 || 12;

            timeElement.textContent = `${now.toDateString()} ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

            const greetingMsg =
                hours < 5 ? 'Good Night' :
                hours < 12 ? 'Good Morning' :
                hours < 17 ? 'Good Afternoon' :
                hours < 20 ? 'Good Evening' : 'Good Night';

            greetingElement.textContent = `${greetingMsg}, Gayatri`;
        }

        // Call once on load, then every minute
        updateGreetTime();
        setInterval(updateGreetTime, 60000);
        function weatherStyle(weatherMain, description) {
            // Clear existing effects
            weatherEffectsContainer.innerHTML = '';
            dynamicBackground.className = 'bg-gradient'; // Reset background classes

            switch (weatherMain) {
                case 'Clear':
                    dynamicBackground.classList.add('bg-sunny');
                    createSunRays();
                    break;
                case 'Clouds':
                    dynamicBackground.classList.add('bg-cloudy');
                    break;
                case 'Rain':
                case 'Drizzle':
                    dynamicBackground.classList.add('bg-rainy');
                    drops(100); // 100 raindrops
                    break;
                case 'Thunderstorm':
                    dynamicBackground.classList.add('bg-thunderstorm');
                    drops(150); // More intense rain
                    createThunderboltFlash();
                    break;
                case 'Snow':
                    dynamicBackground.classList.add('bg-cloudy'); // Using cloudy for now, could add snowflakes
                    // createSnowflakes(100); // Placeholder for snow effect
                    break;
                case 'Mist':
                case 'Fog':
                case 'Haze':
                    dynamicBackground.classList.add('bg-cloudy'); // Using cloudy for hazy/misty conditions
                    break;
                default:
                    dynamicBackground.classList.add('bg-default');
                    break;
            }
        }

        function createSunRays() {
            const sunDiv = document.createElement('div');
            sunDiv.className = 'sun';
            for (let i = 0; i < 4; i++) { // Creating 4 distinct sun rays
                const ray = document.createElement('div');
                ray.className = 'sun-ray';
                sunDiv.appendChild(ray);
            }
            weatherEffectsContainer.appendChild(sunDiv);
        }

        function drops(count) {
            const rainContainer = document.createElement('div');
            rainContainer.className = 'rain-container';
            for (let i = 0; i < count; i++) {
                const drop = document.createElement('div');
                drop.className = 'raindrop';
                drop.style.left = `${Math.random() * 100}vw`; // Random horizontal position
                drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`; // Vary speed
                drop.style.animationDelay = `${Math.random() * 5}s`; // Vary delay
                drop.style.width = `${1 + Math.random() * 1}px`; // Vary width
                drop.style.height = `${10 + Math.random() * 10}px`; // Vary height
                drop.style.opacity = `${0.4 + Math.random() * 0.6}`; // Vary opacity
                rainContainer.appendChild(drop);
            }
            weatherEffectsContainer.appendChild(rainContainer);
        }

        function createThunderboltFlash() {
            const flash = document.createElement('div');
            flash.className = 'thunderbolt-flash';
            weatherEffectsContainer.appendChild(flash);

            // Remove flash after animation ends
            flash.addEventListener('animationend', () => {
                flash.remove();
            });
           
          
        }
createThunderboltFlash();
        // Main function to get location and fetch weather
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            weatherElement.textContent = 'Geolocation not supported.';
            weatherStyle('Default'); // Apply default style if geolocation is not supported
        }

        function success(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                .then(res => {
                    if (!res.ok) { // Check for HTTP errors
                        throw new Error('Network response was not ok for geocoding.');
                    }
                    return res.json();
                })
                .then(data => {
                    const countryCode = data.countryCode;

                    // Step 2: Determine temperature unit based on country code
                    const unit = fahrenheitCountries.includes(countryCode) ? 'imperial' : 'metric';
                    const unitSymbol = unit === 'imperial' ? '°F' : '°C';

                    // Step 3: Fetch weather data from OpenWeatherMap
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`)
                        .then(res => {
                            if (!res.ok) { // Check for HTTP errors
                                throw new Error('Network response was not ok for weather.');
                            }
                            return res.json();
                        })
                        .then(weatherData => {
                            const temp = weatherData.main.temp;
                            const city = weatherData.name;
                            const desc = weatherData.weather[0].description;
                            const weatherMain = weatherData.weather[0].main; // e.g., 'Rain', 'Clear', 'Clouds', 'Thunderstorm'

                            weatherElement.innerHTML = `📍 <b>${city}</b><br>🌡️ ${temp.toFixed(1)}${unitSymbol}<br>☁️ ${desc}`;

                            weatherStyle(weatherMain, desc); 
                        })
                        .catch(err => {
                            console.error('Weather data fetch error:', err);
                            weatherElement.textContent = 'Failed to fetch weather data.';
                            weatherStyle('Default'); // Fallback to default style on weather API error
                        });
                })
                .catch(err => {
                    console.error('Geocoding data fetch error:', err);
                    weatherElement.textContent = 'Could not determine location.';
                    weatherStyle('Default'); 
                });
        }

        function error(err) {
            console.warn(`Geolocation error(${err.code}): ${err.message}`);
            weatherElement.textContent = 'Location access denied ❌';
            weatherStyle('Default'); 
        }