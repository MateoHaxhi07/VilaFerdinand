import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Root from './Root.js';
import './index.css'; // Import the CSS file

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);