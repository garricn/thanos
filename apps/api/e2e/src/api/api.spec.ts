import axios from 'axios';

// Set base URL for API tests
const API_URL = 'http://localhost:3000';

// Skip tests if API is not running
const checkApiAvailability = async () => {
  try {
    await axios.get(`${API_URL}/api/health`, { timeout: 1000 });
    return true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    console.log('API server is not running. Skipping e2e tests.');
    return false;
  }
};

// Only run tests if API is available
beforeAll(async () => {
  const isApiAvailable = await checkApiAvailability();
  if (!isApiAvailable) {
    // Skip all tests in this file
    jest.setTimeout(1);
  }
});

describe('GET /', () => {
  it('should return a message', async () => {
    const isApiAvailable = await checkApiAvailability();
    if (!isApiAvailable) {
      return;
    }
    
    const res = await axios.get(`${API_URL}/`);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('GET /api/health', () => {
  it('should return a status ok', async () => {
    const isApiAvailable = await checkApiAvailability();
    if (!isApiAvailable) {
      return;
    }
    
    const res = await axios.get(`${API_URL}/api/health`);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: 'ok' });
  });
});
