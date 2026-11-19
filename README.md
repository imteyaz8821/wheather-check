# SkyScout Weather

This is a simple weather detect app you can run locally in your browser.

## Features

- Detects your current location and shows live weather
- Lets you search for any city manually
- Shows current temperature, feels-like temperature, humidity, and wind
- Includes a 5-day forecast
- Uses the free Open-Meteo APIs, so no API key is needed

## Run it locally

From this folder:

```powershell
python -m http.server 8000
```

Then open:

[http://localhost:8000](http://localhost:8000)

## Notes

- Browser geolocation usually works on `localhost`, but not when opening `index.html` directly as a file.
- You need an internet connection for the weather API calls and the Google Fonts stylesheet.
