# Assumptions

- **Temperature unit**: Celsius (the API is called with `units=metric`). The sample mockup's "303.15°C" is clearly a Kelvin value mislabelled as Celsius.
- **Search input**: City is required; country is optional and may be a full name ("Japan") or an ISO code ("JP"). With no country, only the city is sent. A mismatched pair (e.g. "Tokyo, MY") is reported as "Not found".
- **Clear button**: resets the City and Country inputs, removes any validation or error message and focuses the City input. It does not remove the displayed weather or the search history; history entries have their own delete buttons.
- **History contents**: stores the API's canonical city name and country code (e.g. "Johor, MY"), not the raw text typed by the user.
- **Duplicates**: searching a location already in history (same city and country, case-insensitive) moves it to the top with the new time rather than adding a second row.
- **History size and order**: newest first, capped at 20 entries (oldest dropped).
- **Search again**: calls the API again with the stored city and country code, updates the weather card, refreshes the timestamp and moves the entry to the top.
- **Failed searches** are not added to history.
- **Times**: the displayed time is the user's local time when the search was made, formatted `DD-MM-YYYY hh:mma` (e.g. `01-09-2022 09:41am`), not the weather station's observation time.
- **Concurrency**: the latest request wins; starting a new search cancels the one in flight.
- **Theme**: defaults to the OS `prefers-color-scheme` and, once the user toggles it, the choice is saved in `localStorage`.
- **Illustration**: the sun-behind-cloud image is shown for Clear skies and for Clouds with weather id 801 or 802 (few/scattered clouds); every other condition shows the rain-cloud image. The image is decorative (empty alt) because the condition is also written as text.
- **Design source**: the sample mockup (purple glassmorphism) was followed over the wireframe, while keeping all information from the wireframe (description, temperature range, humidity, time).
- **API key**: supplied through `VITE_OPENWEATHER_API_KEY` in `.env` (see `.env.example`). Vite embeds it in the client bundle, so this is suitable for a demo with a free key only; a production app would proxy requests through a backend.
- **Browser support**: modern evergreen browsers with `fetch`, `AbortController` and `localStorage`; `crypto.randomUUID` has a fallback.
