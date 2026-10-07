import { test, expect } from '@playwright/test';
import { API_CONFIG, generateDynamicPetData } from '../config/api.config';

test.describe('Part B — Petstore API REST Automation', () => {
  test.describe.configure({ mode: 'serial' });

  const testData = generateDynamicPetData();

  /**
   * Requirement 4: Create a Resource (Happy Path)
   */
  test('4. Create a Resource (POST)', async ({ request }) => {
    const response = await request.post(`${API_CONFIG.BASE_URL}/v2/pet`, {
      headers: API_CONFIG.DEFAULT_HEADERS,
      data: {
        id: testData.id,
        name: testData.name,
        status: testData.status,
        photoUrls: testData.photoUrls,
        tags: [{ id: 1, name: 'unified-lead-framework' }]
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testData.id);
    expect(body.name).toBe(testData.name);
  });

  /**
   * NEGATIVE VALIDATION 1: Malformed Body Input (Bad Request)
   */
  test('4b. Create a Resource - Negative Validation (Malformed Payload)', async ({ request }) => {
    const response = await request.post(`${API_CONFIG.BASE_URL}/v2/pet`, {
      headers: API_CONFIG.DEFAULT_HEADERS,
      data: {
        id: testData.id,
        name: testData.name,
        photoUrls: "not-an-array-string-error" 
      }
    });

    expect(response.status()).not.toBe(200);
  });

  /**
   * Requirement 5: Read and Verify (Happy Path)
   */
  test('5. Read and Verify (GET)', async ({ request }) => {
    const response = await request.get(`${API_CONFIG.BASE_URL}/v2/pet/${testData.id}`, {
      headers: API_CONFIG.DEFAULT_HEADERS
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testData.id);
    expect(body.name).toBe(testData.name);
  });

  /**
   * NEGATIVE VALIDATION 2: Resource Not Found Verification
   */
  test('5b. Read and Verify - Negative Validation (Non-Existent ID)', async ({ request }) => {
    const nonExistentId = 999999999999; 
    
    const response = await request.get(`${API_CONFIG.BASE_URL}/v2/pet/${nonExistentId}`, {
      headers: API_CONFIG.DEFAULT_HEADERS
    });

    expect(response.status()).toBe(404);
    const errorBody = await response.json();
    expect(errorBody).toStrictEqual({
      code: 1,
      type: 'error',
      message: 'Pet not found'
    });
  });

  /**
   * Requirement 6: Update a Resource
   */
  test('6. Update a Resource (PUT)', async ({ request }) => {
    const response = await request.put(`${API_CONFIG.BASE_URL}/v2/pet`, {
      headers: API_CONFIG.DEFAULT_HEADERS,
      data: {
        id: testData.id,
        name: testData.updatedName,
        status: 'pending'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testData.id);
    expect(body.name).toBe(testData.updatedName);
  });

  /**
   * Requirement 7: Delete and Confirm
   */
  test('7. Delete and Confirm (DELETE)', async ({ request }) => {
    const deleteResponse = await request.delete(`${API_CONFIG.BASE_URL}/v2/pet/${testData.id}`, {
      headers: API_CONFIG.DEFAULT_HEADERS
    });
    expect(deleteResponse.status()).toBe(200);

    const verifyGetResponse = await request.get(`${API_CONFIG.BASE_URL}/v2/pet/${testData.id}`, {
      headers: API_CONFIG.DEFAULT_HEADERS
    });
    expect(verifyGetResponse.status()).toBe(404);
  });
});
