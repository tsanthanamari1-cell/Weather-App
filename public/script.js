// async function getWeather() {

//     let city = document.getElementById("city").value;


//     document.getElementById("suggestions").innerHTML = "";
// document.getElementById("suggestions").style.display = "none";

   
//     let url = `http://localhost:3000/weather?city=${city}`;



//     try {
//         document.getElementById("result").innerHTML="<h3>Loading......</h3>";

//         let response = await fetch(url);

//         let data = await response.json();

//         if(data.cod == 200){
             


//             document.getElementById("result").innerHTML = `
//                 <h2>${data.name}</h2>
//                 <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
//                 <p>Temperature: ${data.main.temp} °C</p>
//                 <p>Humidity: ${data.main.humidity}%</p>
//                 <p>Wind Speed: ${data.wind.speed} m/s</p>
//                 <p>Weather: ${data.weather[0].description}</p>
//             `;
//         }
//         else{
//             document.getElementById("result").innerHTML =
//             "City not found";
//         }

//     }
//     catch(error){
//         console.log(error);
//     }
// }




// const cityInput = document.getElementById("city");
// const suggestionsBox = document.getElementById("suggestions");

// cityInput.addEventListener("input", async function () {

//     const city = cityInput.value.trim();

//     if (city.length < 3) {
//         suggestionsBox.innerHTML = "";
//         suggestionsBox.style.display = "none";
//         return;
//     }

//     try {
//         const response = await fetch(
//             `http://localhost:3000/city-suggestions?city=${encodeURIComponent(city)}`
//         );

//         const suggestions = await response.json();

//         suggestionsBox.innerHTML = "";

//         if (suggestions.length === 0) {
//             suggestionsBox.style.display = "none";
//             return;
//         }

//         suggestions.forEach(place => {

//             const suggestion = document.createElement("div");

          


//             suggestion.innerHTML = `
//     <div class="suggestion-icon">📍</div>

//     <div class="suggestion-info">
//         <div class="suggestion-city">${place.name}</div>

//         <div class="suggestion-location">
//             ${place.state ? place.state + ", " : ""}
//             ${place.country ? place.country : ""}
//         </div>
//     </div>
// `;

            


//             suggestion.addEventListener("click", function () {

//     cityInput.value = place.name;

//     suggestionsBox.innerHTML = "";
//     suggestionsBox.style.display = "none";

//     getWeather();
// });

//             suggestionsBox.appendChild(suggestion);
//         });

//         suggestionsBox.style.display = "block";

//     } catch (error) {
//         console.log("Suggestion error:", error);
//     }
// });




// document.getElementById("city").addEventListener("keypress",function(event){
//     if(event.key=="Enter"){
//         getWeather();
//     }
// });




// Store the selected city's coordinates
let selectedCity = null;


// ===============================
// GET WEATHER
// ===============================



const API_BASE_URL = "https://weather-app-y6s8.onrender.com";
async function getWeather() {

    const cityInput = document.getElementById("city");
    const suggestionsBox = document.getElementById("suggestions");
    const result = document.getElementById("result");

    const city = cityInput.value.trim();

    if (!city) {
        result.innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    // Hide suggestions
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";

    result.innerHTML = "<h3>Loading......</h3>";

    try {

        let url;

        // If user selected a suggestion, use exact coordinates
        if (selectedCity) {

            url =
    `${API_BASE_URL}/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}`;
                

        } else {

            // If user manually typed a city
            url =
    `${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`;
                
        }

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {

            result.innerHTML =
                `<p>${data.message || "Unable to fetch weather data"}</p>`;

            return;
        }

        // Weather display
        result.innerHTML = `
            <div class="weather-card">

                <h2>${data.name}</h2>

                <img 
                    src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
                    alt="${data.weather[0].description}"
                >

                <p>
                    Temperature:
                    ${data.main.temp} °C
                </p>

                <p>
                    Feels Like:
                    ${data.main.feels_like} °C
                </p>

                <p>
                    Humidity:
                    ${data.main.humidity}%
                </p>

                <p>
                    Wind Speed:
                    ${data.wind.speed} m/s
                </p>

                <p>
                    Pressure:
                    ${data.main.pressure} hPa
                </p>

                <p>
                    Weather:
                    ${data.weather[0].description}
                </p>

            </div>
        `;

        // Reset selected city after successful search
        selectedCity = null;

    } catch (error) {

        console.log("Weather error:", error);

        result.innerHTML =
            "<p>Unable to connect to the weather server.</p>";
    }
}


// ===============================
// CITY AUTOCOMPLETE
// ===============================

const cityInput = document.getElementById("city");
const suggestionsBox = document.getElementById("suggestions");

let suggestionTimeout;


// When user types
cityInput.addEventListener("input", function () {

    const city = cityInput.value.trim();

    // User is typing again, so previous selection is no longer valid
    selectedCity = null;

    clearTimeout(suggestionTimeout);

    if (city.length < 3) {

        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";

        return;
    }

    // Small delay prevents API request for every single keystroke
    suggestionTimeout = setTimeout(() => {

        loadSuggestions(city);

    }, 300);
});


// ===============================
// LOAD CITY SUGGESTIONS
// ===============================

async function loadSuggestions(city) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/city-suggestions?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {

            throw new Error("Unable to get suggestions");

        }

        const suggestions = await response.json();

        suggestionsBox.innerHTML = "";

        if (!suggestions.length) {

            suggestionsBox.style.display = "none";

            return;
        }


        // Create suggestions
        suggestions.forEach(place => {

            const suggestion = document.createElement("div");

            suggestion.className = "suggestion-item";

            suggestion.innerHTML = `
                <div class="suggestion-icon">
                    📍
                </div>

                <div class="suggestion-info">

                    <div class="suggestion-city">
                        ${place.name}
                    </div>

                    <div class="suggestion-location">
                        ${place.state ? place.state + ", " : ""}
                        ${place.country || ""}
                    </div>

                </div>
            `;


            // Click suggestion
            suggestion.addEventListener("click", function () {

                // Put city name inside search box
                cityInput.value = place.name;

                // Save exact location
                selectedCity = {
                    name: place.name,
                    lat: place.lat,
                    lon: place.lon
                };

                // Hide suggestions
                suggestionsBox.innerHTML = "";
                suggestionsBox.style.display = "none";

                // Automatically search weather
                getWeather();

            });


            suggestionsBox.appendChild(suggestion);

        });


        suggestionsBox.style.display = "block";

    } catch (error) {

        console.log("Suggestion error:", error);

        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
    }
}


// ===============================
// ENTER KEY
// ===============================

cityInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        getWeather();

    }

});