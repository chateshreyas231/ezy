// logic/complianceRules.ts
// Compliance rules helper - canUser(action, role, state)
import { getComplianceRules } from '../src/utils/getComplianceRules';
import type { Role } from '../src/types/types';

/**
 * Check if a user with given role and state can perform an action
 */
export function canUser(action: string, role: Role, state: string): boolean {
  try {
    const rules = getComplianceRules(state.toLowerCase(), role);
    return rules[action] === true;
  } catch (error) {
    // If state/role not found, default to false for safety
    console.warn(`Compliance check failed for ${role} in ${state}:`, error);
    return false;
  }
}

/**
 * Get all permitted actions for a role in a state
 */
export function getPermittedActions(role: Role, state: string): string[] {
  try {
    const rules = getComplianceRules(state.toLowerCase(), role);
    return Object.entries(rules)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  } catch (error) {
    console.warn(`Failed to get permitted actions for ${role} in ${state}:`, error);
    return [];
  }
}

