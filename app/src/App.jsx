import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Notification from './components/Notification';
import { ROUTES } from './config/routing';

import axios from 'axios';

axios.get("http://server:5000/api").then(() => console.log("worked 1")).catch(e => console.log("failed 1"));
axios.get("http://localhost:5000/api").then(() => console.log("worked 2")).catch(e => console.log("failed 2"));
axios.get("http://localhost:3000/api").then(() => console.log("worked 3")).catch(e => console.log("failed 3"));
axios.get("http://localhost/api").then(() => console.log("worked 4")).catch(e => console.log("failed 4"));
axios.get("http://0.0.0.0/api").then(() => console.log("worked 5")).catch(e => console.log("failed 5"));
axios.get("http://0.0.0.0:5000/api").then(() => console.log("worked 6")).catch(e => console.log("failed 6"));

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
