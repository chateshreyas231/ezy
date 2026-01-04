// src/utils/getComplianceRules.ts
import compliance from '../legal/compliance';
import type { Role } from '../types/types';

// ✅ Restrict keys to *string* keys so TS doesn't include `symbol`
type State = Extract<keyof typeof compliance, string>;
type RoleMap = (typeof compliance)[State];
type AnyRole = keyof RoleMap;
type AnyFeature = keyof NonNullable<RoleMap[AnyRole]>;

/**
 * Returns all compliance rules for a given state + role.
 * Throws helpful errors if the state/role isn't defined.
 */
export function getComplianceRules(state: State, role: Role) {
  const stateRules = compliance[state];
  if (!stateRules) {
    throw new Error(`No compliance rules found for state: ${state}`);
  }

  const roleRules = stateRules[role as keyof typeof stateRules];
  if (!roleRules) {
    throw new Error(`No compliance rules found for role: ${role} in state: ${state}`);
  }

  return roleRules;
}
