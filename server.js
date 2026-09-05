require("dotenv").config();
console.log("mongo URI exists:",!! process.env.MONGO_URI);

const express = require("express");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        console.log("Database name:", mongoose.connection.name);
        console.log("Connected host:", mongoose.connection.host);
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });





const weatherSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },

    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    pressure: Number,
    visibility: Number,
    weather: String,

    searchedAt: {
        type: Date,
        default: Date.now
    }
});



const Weather = mongoose.model("Weather", weatherSchema, "weathers");


// Serve frontend
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);





app.get("/weather", async (req, res) => {

    try {

        const city = req.query.city;
        const lat = req.query.lat;
        const lon = req.query.lon;

        const apiKey = process.env.API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                message: "OpenWeather API key is missing"
            });

        }


        let url;


        if (lat && lon) {

            url =
                `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=metric`;

        }

        else if (city) {

            url =
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

        }


        else {

            return res.status(400).json({
                message: "City is required"
            });

        }


        // Get weather from OpenWeather
        const response = await axios.get(url);

        const data = response.data;

        const weatherRecord = new Weather({

            city: data.name,

            temperature: data.main.temp,

            feelsLike: data.main.feels_like,

            humidity: data.main.humidity,

            windSpeed: data.wind.speed,

            pressure: data.main.pressure,

            visibility: data.visibility,

            weather: data.weather[0].description

        });


        await weatherRecord.save();


        console.log("Weather search saved to MongoDB");


        
        res.json(data);


    }

    catch (error) {

        console.log(
            "Weather API error:",
            error.response?.data || error.message
        );


        if (error.response?.status === 404) {

            return res.status(404).json({
                message: "City not found"
            });

        }


        if (error.response?.status === 401) {

            return res.status(401).json({
                message: "Invalid OpenWeather API key"
            });

        }


        res.status(500).json({
            message: "Unable to fetch weather data"
        });

    }

});

app.get("/history", async (req, res) => {

    try {

        const history = await Weather
            .find()
            .sort({ searchedAt: -1 })
            .limit(10);

        res.json(history);

    }

    catch (error) {

        console.log(
            "History error:",
            error.message
        );

        res.status(500).json({
            message: "Unable to get search history"
        });

    }

});



app.get("/city-suggestions", async (req, res) => {
    const city = req.query.city?.trim();

    if (!city || city.length < 3) {
        return res.json([]);
    }

    try {
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/autocomplete",
            {
                params: {
                    text: city,
                    type: "city",
                    limit: 5,
                    apiKey: process.env.GEOAPIFY_API_KEY
                }
            }
        );

        const suggestions = response.data.features.map(feature => ({
            name: feature.properties.city || feature.properties.name,
            state: feature.properties.state || "",
            country: feature.properties.country || "",
            lat: feature.properties.lat,
            lon: feature.properties.lon
        }));

        res.json(suggestions);

    } catch (error) {
        console.log("Geoapify suggestion error:", error.message);

        res.status(500).json({
            message: "Unable to get city suggestions"
        });
    }
});






app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

});
