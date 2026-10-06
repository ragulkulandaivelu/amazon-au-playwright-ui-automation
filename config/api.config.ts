/**
 * Shared API Configuration Constants
 * Hardened to match the exact single-domain root constraint requirement.
 */
export const API_CONFIG = {
  // Strict operational base domain limit requirement
  BASE_URL: 'https://petstore.swagger.io',
  TIMEOUT: 15000,
  
  // Mandatory headers to ensure context payloads parse as valid REST requests
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

/**
 * Dynamic Test Data Generation Utility
 */
export function generateDynamicPetData() {
  const uniqueTimestamp = Date.now();
  return {
    id: Math.floor(10000000 + Math.random() * 90000000),
    name: `AutomationPet_${uniqueTimestamp}`,
    updatedName: `AutomationPet_${uniqueTimestamp}_Updated`,
    status: 'available',
    photoUrls: ['https://example.com']
  };
}
