// Background.js
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const Background = ({ color, children }) => (
  <LinearGradient
    colors={[color || '#FFFFFF', '#69c4f2']} // if color is null, default to '#FFFFFF'
    style={{ flex: 1 }}
  >
    {children}
  </LinearGradient>
);

export default Background;