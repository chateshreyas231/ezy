// src/utils/testCompliance.mts
import { getComplianceRules } from './getComplianceRules';

try {
  const rules = getComplianceRules('illinois', 'fsboSeller');
  console.log('✅ FSBO Seller in Illinois:', rules);
} catch (error) {
  console.error('❌ Error:', error);
}
