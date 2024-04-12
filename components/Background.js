import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const Background = ({ children }) => (
  <LinearGradient
    colors={['lightsteelblue', '#69c4f2']}
    style={{ flex: 1 }}
  >
    {children}
  </LinearGradient>
);

export default Background;