import React from 'react';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  // Temporary no-op guard so the app runs while we finish wiring auth.
  return <>{children}</>;
}
