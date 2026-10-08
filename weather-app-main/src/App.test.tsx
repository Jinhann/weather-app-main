import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { THEME_STORAGE_KEY, ThemeProvider } from './context/theme/ThemeProvider';
import { WeatherProvider } from './context/weather/WeatherProvider';
import { johorResponse, jsonResponse } from './test/fixtures';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

function renderApp() {
  return render(
    <ThemeProvider>
      <WeatherProvider>
        <App />
      </WeatherProvider>
    </ThemeProvider>,
  );
}

async function search(user: ReturnType<typeof userEvent.setup>, city: string, country = '') {
  await user.clear(screen.getByLabelText('City'));
  await user.type(screen.getByLabelText('City'), city);
  await user.clear(screen.getByLabelText('Country'));
  if (country) await user.type(screen.getByLabelText('Country'), country);
  await user.click(screen.getByRole('button', { name: 'Search' }));
}

describe('App', () => {
  it('shows an empty state before searching', () => {
    renderApp();
    expect(screen.getByText("Search for a city to see today's weather.")).toBeInTheDocument();
    expect(screen.getByText('No Record')).toBeInTheDocument();
  });

  it('shows the weather and records history after a successful search', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(johorResponse));
    renderApp();

    await search(user, 'Johor', 'Malaysia');

    expect(await screen.findByText('29°')).toBeInTheDocument();
    expect(screen.getByText('H: 31° L: 26°')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 58%')).toBeInTheDocument();
    expect(screen.getByText('Scattered clouds')).toBeInTheDocument();
    expect(screen.getByText('Clouds')).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[0][0])).toContain('q=Johor%2CMalaysia');

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Johor, MY');
    expect(screen.queryByText('No Record')).not.toBeInTheDocument();
  });

  it('shows an alert for an unknown city and keeps history unchanged', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse({ cod: '404', message: 'city not found' }, 404));
    renderApp();

    await search(user, 'Nowhereville');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Not found. Please check the city and country names.',
    );
    expect(screen.getByText('No Record')).toBeInTheDocument();
  });

  it('shows a network error message', async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    renderApp();

    await search(user, 'Tokyo');

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the weather service');
  });

  it('validates an empty city without calling the API', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText('Please enter a city name.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits with the Enter key', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(johorResponse));
    renderApp();

    await user.type(screen.getByLabelText('City'), 'Johor{Enter}');

    expect(await screen.findByText('29°')).toBeInTheDocument();
  });

  it('shows a loading state while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveFetch: (response: Response) => void = () => undefined;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (resolveFetch = resolve)));
    renderApp();

    await search(user, 'Johor');

    const button = screen.getByRole('button', { name: 'Searching…' });
    expect(button).toBeDisabled();

    resolveFetch(jsonResponse(johorResponse));
    expect(await screen.findByRole('button', { name: 'Search' })).toBeEnabled();
  });

  it('clears the inputs and the error message with Clear', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse({ cod: '404', message: 'city not found' }, 404));
    renderApp();
    await search(user, 'Nowhereville', 'XX');
    await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByLabelText('City')).toHaveValue('');
    expect(screen.getByLabelText('Country')).toHaveValue('');
    expect(screen.getByLabelText('City')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('searches again from history and moves the entry to the top', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(jsonResponse(johorResponse));
    renderApp();
    await search(user, 'Johor');
    await screen.findByText('29°');

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...johorResponse, name: 'Tokyo', sys: { country: 'JP' } }),
    );
    await search(user, 'Tokyo');
    await screen.findByRole('button', { name: 'Search' });

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...johorResponse, main: { ...johorResponse.main, temp: 33.2 } }),
    );
    await user.click(screen.getByRole('button', { name: 'Search Johor, MY again' }));

    expect(await screen.findByText('33°')).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[2][0])).toContain('q=Johor%2CMY');
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Johor, MY');
    expect(items[1]).toHaveTextContent('Tokyo, JP');
  });

  it('deletes history entries and shows "No Record" when empty', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(johorResponse));
    renderApp();
    await search(user, 'Johor');
    await screen.findByText('29°');

    await user.click(screen.getByRole('button', { name: 'Delete Johor, MY from history' }));

    expect(screen.getByText('No Record')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('keeps history after the app is unmounted and mounted again', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(johorResponse));
    const { unmount } = renderApp();
    await search(user, 'Johor');
    await screen.findByText('29°');
    unmount();

    renderApp();

    expect(screen.getByRole('list')).toHaveTextContent('Johor, MY');
  });

  it('toggles and persists the theme', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(document.documentElement.dataset.theme).toBe('light');

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('"dark"');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
