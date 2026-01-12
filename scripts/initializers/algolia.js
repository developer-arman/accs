// Algolia Search Initializer
// This initializer sets up the Algolia search using the Drop-in

import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';
import { initializeAlgolia as initAlgolia } from '../../dropins/algoliaSearch/api.js';

let initPromise = null;

export async function initializeAlgolia() {
  if (!initPromise) {
    initPromise = (async () => {
      // Get Algolia configuration from config.json
      const algoliaConfig = {
        applicationId: getConfigValue('algolia.applicationId') || '',
        apiKey: getConfigValue('algolia.apiKey') || '',
        indexName: getConfigValue('algolia.indexName') || 'products',
      };

      if (!algoliaConfig.applicationId || !algoliaConfig.apiKey) {
        console.warn('Algolia configuration is missing in config.json');
        return null;
      }

      // Initialize Algolia with config
      const result = await initAlgolia(algoliaConfig);

      return result;
    })();
  }
  return initPromise;
}

export { initAlgolia };
