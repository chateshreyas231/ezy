import type { LoginPortal, UserRole } from './types/app';

export function portalToDbRole(portal: LoginPortal): UserRole {
  if (portal === 'agent') return 'buyer_agent';
  if (portal === 'broker_vendor') return 'seller_agent';
  return 'buyer';
}

export function dbRoleToPortal(role: UserRole | null | undefined): LoginPortal {
  if (!role) return 'client';
  if (role === 'buyer_agent') return 'agent';
  if (role === 'seller_agent') return 'broker_vendor';
  return 'client';
}

export function allowedRolesForPortal(portal: LoginPortal): UserRole[] {
  if (portal === 'agent') return ['buyer_agent'];
  if (portal === 'broker_vendor') return ['seller_agent'];
  return ['buyer', 'seller'];
}

export function labelForPortal(portal: LoginPortal): string {
  if (portal === 'agent') return 'Agent';
  if (portal === 'broker_vendor') return 'Broker/Vendor';
  return 'Client';
}
