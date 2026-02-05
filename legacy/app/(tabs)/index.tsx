// app/(tabs)/index.tsx - Role-based home screen
import React from 'react';
import AgentHomeScreen from '../../components/role-screens/AgentHomeScreen';
import BuyerHomeScreen from '../../components/role-screens/BuyerHomeScreen';
import DefaultHomeScreen from '../../components/role-screens/DefaultHomeScreen';
import SellerHomeScreen from '../../components/role-screens/SellerHomeScreen';
import { useUser } from '../context/UserContext';

export default function HomeScreen() {
  const { user, loading } = useUser();

  // Show loading state
  if (loading) {
    return <DefaultHomeScreen />;
  }

  // Route to role-specific home screen
  if (!user) {
    return <DefaultHomeScreen />;
  }

  const role = user.role;

  // Buyer roles
  if (role === 'buyer') {
    return <BuyerHomeScreen key={`buyer-${user.id}`} />;
  }

  // Seller roles
  if (role === 'seller' || role === 'fsboSeller') {
    return <SellerHomeScreen key={`seller-${user.id}`} />;
  }

  // Agent roles
  if (role === 'buyerAgent' || role === 'listingAgent' || role === 'selfRepresentedAgent' || role === 'teamLead') {
    return <AgentHomeScreen key={`agent-${user.id}`} />;
  }

  // Default for other roles (vendor, vendorAttorney, guest, etc.)
  return <DefaultHomeScreen key={`default-${user.id}`} />;
}
