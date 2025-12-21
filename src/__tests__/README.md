# Frontend Tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.jsx
```

## Test Structure

- `src/__tests__/setup.js` - Test configuration
- `src/__tests__/App.test.jsx` - App component tests
- `src/__tests__/components/Button.test.jsx` - Button component tests
- `src/__tests__/lib/api.test.js` - API configuration tests

## Mocking

- API calls are mocked
- localStorage is mocked
- Router uses MemoryRouter for tests

## Notes

- Use MemoryRouter instead of BrowserRouter in tests
- Mock external dependencies (API, localStorage)
- Clean up after each test







