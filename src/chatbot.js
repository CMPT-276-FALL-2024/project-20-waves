const API_KEY = 'YOUR_API_KEY';
const city = 'London,uk';
const url = ``;

fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log(`Temperature in ${city}: ${data.main.temp}°C`);
  })
  .catch(error => console.error('Error:', error));