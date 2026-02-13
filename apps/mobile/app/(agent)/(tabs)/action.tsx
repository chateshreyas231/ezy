import React from 'react';
import { View } from 'react-native';

// This component is never actually rendered because the tab press is intercepted
export default function ActionPlaceholder() {
    return <View />;
}
