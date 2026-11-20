import React from 'react';
import { createRoot } from 'react-dom/client';
import AnimatedHeart from './AnimatedHeart.jsx';

const mount = document.getElementById('heart-root');
const question = document.getElementById('question');

if (mount && !question.hidden) {
  const root = createRoot(mount);
  root.render(<AnimatedHeart />);
  document.addEventListener('heart:close', () => root.unmount(), { once: true });
}
