import React from 'react';
import { createRoot } from 'react-dom/client';
import AnimatedHeart from './AnimatedHeart.jsx';

const mount = document.getElementById('heart-root');
if (mount) {
  const root = createRoot(mount);
  root.render(<AnimatedHeart />);
}
