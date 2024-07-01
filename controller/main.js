const axios = require("axios");

exports.greetVisitor = async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";
  const clientIpAddress = req.ip.includes("::ffff:")
    ? req.ip.split("::ffff:")[1]
    : req.ip;

  let location = "unknown";
  let temperature = "unknown";

  //check for local IP
  if (clientIpAddress === "127.0.0.1" || clientIpAddress === "::1") {
    location = "New York";
  } else {
    try {
      const geoRes = await axios.get(
        `https://api.ipgeolocation.io/ipgeo?apiKey=0b1b0ca07062407894e5f44ccf28971e&ip=${clientIpAddress}`
      );
      if (
        geoRes.data.message ===
        "'127.0.0.1' is a bogon (Internet Assigned Numbers Authority) IP address."
      ) {
        location = "localhost";
      } else {
        location = geoRes.data.city || "unknown";
        console.log("Geo data:", geoRes.data);

        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=baabf6dbfdad17211b98d497d93b071b&units=metric`
        );
        const weatherData = weatherRes.data;
        temperature = weatherData.main.temp || "unknown";
        console.log("Weather data:", weatherData);
      }
    } catch (error) {
      console.log("Error fetching location or weather data:", error.message);
    }
  }

  res.json({
    client_ip: clientIpAddress,
    location: location,
    greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`,
  });
};
