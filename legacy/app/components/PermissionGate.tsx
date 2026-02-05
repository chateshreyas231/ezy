// app/components/PermissionGate.tsx
// Wrapper component for permission checks
import React from 'react';
import { Text, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { canUser } from '../../logic/complianceRules';
import type { Role } from '../../src/types/types';

interface PermissionGateProps {
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showReason?: boolean;
}

/**
 * PermissionGate component - only renders children if user has permission
 */
export default function PermissionGate({
  action,
  children,
  fallback,
  showReason = false,
}: PermissionGateProps) {
  const { user } = useUser();

  if (!user || !user.state) {
    return (
      <View>
        {showReason && (
          <Text style={{ color: '#666', fontSize: 12 }}>
            Please set your role and state in profile
          </Text>
        )}
        {fallback || null}
      </View>
    );
  }

  const hasPermission = canUser(action, user.role, user.state);

  if (!hasPermission) {
    return (
      <View>
        {showReason && (
          <Text style={{ color: '#666', fontSize: 12 }}>
            You don't have permission to {action} in {user.state}
          </Text>
        )}
        {fallback || null}
      </View>
    );
  }

  return <>{children}</>;
}

