require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

const IP_GEOLOCATION_API_KEY = process.env.IP_GEOLOCATION_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

app.set("trust proxy", true);

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";
  let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Handle IPv6 prefix
  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.split(":").pop();
  }

  // Handle local IP addresses
  if (clientIp === "::1" || clientIp === "127.0.0.1") {
    clientIp = "8.8.8.8"; // Use a mock IP address for testing
  }

  try {
    // Get location data from IP Geolocation API
    const geoApiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${IP_GEOLOCATION_API_KEY}&ip=${clientIp}`;
    const geoResponse = await axios.get(geoApiUrl);
    const location = geoResponse.data.city || "Unknown Location";
    console.log(location);

    // Get weather data from WeatherAPI
    const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${location}`;
    const weatherResponse = await axios.get(weatherApiUrl);
    const temperature = weatherResponse.data.current.temp_c;
    console.log(temperature);

    // Construct the response
    const response = {
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}`,
    };

    // Set the Content-Type header to application/json
    res.setHeader("Content-Type", "application/json");
    // Send the response with 2-space indentation for readability
    res.send(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
