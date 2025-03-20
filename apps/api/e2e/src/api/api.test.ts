import axios from 'axios';

describe('API', () => {
  it('should return Hello World from the root endpoint', async () => {
    const response = await axios.get('http://localhost:3000/');
    expect(response.status).toBe(200);
    expect(response.data).toBe('Hello World');
  });
});
