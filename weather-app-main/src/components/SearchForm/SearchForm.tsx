import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useWeather } from '../../context/weather/useWeather';
import { Button } from '../Button/Button';
import { SearchIcon } from '../icons/Icons';
import { TextField } from '../TextField/TextField';
import './SearchForm.css';

/** City (required) and country (optional) search form with inline validation. */
export function SearchForm() {
  const { status, search, clearError } = useWeather();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setValidationError('Please enter a city name.');
      cityInputRef.current?.focus();
      return;
    }
    setValidationError(null);
    search({ city: trimmedCity, country: country.trim() });
  }

  function handleClear() {
    setCity('');
    setCountry('');
    setValidationError(null);
    clearError();
    cityInputRef.current?.focus();
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <TextField
        ref={cityInputRef}
        className="search-form__field"
        label="City"
        name="city"
        autoComplete="off"
        value={city}
        aria-invalid={validationError ? true : undefined}
        aria-describedby={validationError ? errorId : undefined}
        onChange={(event) => {
          setCity(event.target.value);
          setValidationError(null);
        }}
      />
      <TextField
        className="search-form__field"
        label="Country"
        name="country"
        autoComplete="off"
        value={country}
        onChange={(event) => setCountry(event.target.value)}
      />
      <div className="search-form__actions">
        <Button
          type="submit"
          icon={<SearchIcon width={16} height={16} />}
          loading={status === 'loading'}
          loadingText="Searching…"
        >
          Search
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </div>
      {validationError && (
        <p id={errorId} className="search-form__error" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
