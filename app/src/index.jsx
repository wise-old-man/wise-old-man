import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './index.scss';

import App from './App';

// Test staging 10

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
