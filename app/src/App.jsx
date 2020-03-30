import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Notification from './components/Notification';
import { ROUTES } from './config/routing';

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Notification />
      <div className="content">
        <Switch>
          {ROUTES.map(route => (
            <Route key={route.path} exact path={route.path} component={route.component} />
          ))}
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
