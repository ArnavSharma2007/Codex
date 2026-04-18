Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_BACKEND_URL: 'http://localhost:5000',
      },
    },
  },
});

import '@testing-library/jest-dom';
