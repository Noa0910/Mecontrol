export const config = {
  API_URL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'),
  APP_TITLE: 'MedControl - Sistema de Morbilidad en Urgencias',
  APP_VERSION: '1.0.0',
  TIMEOUT: 10000,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    PAGE_SIZE_OPTIONS: [25, 50, 100]
  }
};




