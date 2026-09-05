
// require("dotenv").config();
// console.log("API Key:", process.env.API_KEY);
// const express = require("express");
// const path = require("path");
// const axios = require("axios");

// const app = express();

// const PORT = process.env.PORT || 3000;

// // app.get("/", (req, res) => {
// //     res.send("Welcome to Weather App Backend!");
// // });
// app.use(express.static(path.join(__dirname,"public")));
// app.get("/weather", async(req, res) => {
//     // const city = req.query.city;
//     // res.send(city);
//     try{
//         const city=req.query.city;
//         // const apiKey=process.env.API_KEY;
//         // const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
//         // const response=await axios.get(url);
//         if(!city){
//             return res.status(400).json({
//                 message:"city is required"
//             });
//         }
//         const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
//         const response=await axios.get(url);

//         res.json(response.data);
//     }
//     catch(error){
//         // console.log(error.response?.data || error.message);
//         console.log("weather API error:",error.message)
//         res.status(500).json({
//            message:"Error fetching weather data" 
//         });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });





require("dotenv").config();
console.log("mongo URI exists:",!! process.env.MONGO_URI);

const express = require("express");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;


// MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("MongoDB connected successfully");
//     })
//     .catch((error) => {
//         console.log("MongoDB connection error:", error.message);
//     });
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        console.log("Database name:", mongoose.connection.name);
        console.log("Connected host:", mongoose.connection.host);
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });




// Weather Schema
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


// Weather Model
//const Weather = mongoose.model("Weather", weatherSchema);
const Weather = mongoose.model("Weather", weatherSchema, "weathers");


// Serve frontend
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// Weather API
// app.get("/weather", async (req, res) => {

//     try {

//         const city = req.query.city;

//         if (!city) {
//             return res.status(400).json({
//                 message: "City is required"
//             });
//         }

//         const apiKey = process.env.API_KEY;

//         if (!apiKey) {
//             return res.status(500).json({
//                 message: "OpenWeather API key is missing"
//             });
//         }

//         const url =
//             `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

//         const response = await axios.get(url);

//         const data = response.data;


//         // Save weather search to MongoDB
//         const weatherRecord = new Weather({

//             city: data.name,

//             temperature: data.main.temp,

//             feelsLike: data.main.feels_like,

//             humidity: data.main.humidity,

//             windSpeed: data.wind.speed,

//             pressure: data.main.pressure,

//             visibility: data.visibility,

//             weather: data.weather[0].description

//         });

//         // await weatherRecord.save();

//         // console.log("Weather search saved to MongoDB");

//         const savedRecord = await weatherRecord.save();

// console.log("Weather search saved to MongoDB");
// console.log("Saved document ID:", savedRecord._id);
// console.log("Saved database:", mongoose.connection.name);
// console.log("Saved collection:", Weather.collection.name);
// const count = await Weather.countDocuments();

// console.log("Total weather records:", count);


//         // Send weather data to frontend
//         res.json(data);

//     }

//     catch (error) {

//         console.log(
//             "Weather API error:",
//             error.response?.data || error.message
//         );

//         if (error.response?.status === 404) {

//             return res.status(404).json({
//                 message: "City not found"
//             });

//         }

//         if (error.response?.status === 401) {

//             return res.status(401).json({
//                 message: "Invalid OpenWeather API key"
//             });

//         }

//         res.status(500).json({
//             message: "Unable to fetch weather data"
//         });

//     }

// });


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


        // =====================================
        // OPTION 1: Search using coordinates
        // =====================================

        if (lat && lon) {

            url =
                `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=metric`;

        }


        // =====================================
        // OPTION 2: Search using city name
        // =====================================

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


        // =====================================
        // SAVE WEATHER TO MONGODB
        // =====================================

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


        // Send data to frontend
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


// Search history
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


// Start server

// app.get("/city-suggestions", async (req, res) => {
//     const city = req.query.city;

//     if (!city || city.length < 2) {
//         return res.json([]);
//     }

//     try {
//         const response = await axios.get(
//             "https://api.openweathermap.org/geo/1.0/direct",
//             {
//                 params: {
//                     q: city,
//                     limit: 5,
//                     appid: process.env.API_KEY
//                 }
//             }
//         );

//         const suggestions = response.data.map(place => ({
//             name: place.name,
//             state: place.state || "",
//             country: place.country,
//             lat: place.lat,
//             lon: place.lon
//         }));

//         res.json(suggestions);

//     } catch (error) {
//         console.log("City suggestion error:", error.message);
//         res.status(500).json({
//             message: "Unable to get city suggestions"
//         });
//     }
// });

// City autocomplete using Geoapify
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