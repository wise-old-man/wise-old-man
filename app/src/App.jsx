import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';
import Analytics from 'react-ga';
import { NavigationBar, Notification, GlobalMessage } from 'components';
import NotFound from 'pages/NotFound';
import { uniformUrl } from 'services/analytics';
import { ROUTES, getRoute } from 'config/routing';

function initGoogleAnalytics() {
  const trackingId = process.env.REACT_APP_ANALYTICS_TRACKING_ID;
  const testMode = process.env.NODE_ENV === 'development';

  Analytics.initialize(trackingId, { testMode });
}

function shouldScrollToTop(currentPath, previousPath) {
  if (!currentPath || !previousPath) {
    return true;
  }

  const currentRoute = getRoute(currentPath);
  const previousRoute = getRoute(previousPath);

  // Is is completely different route
  if (currentRoute !== previousRoute) {
    return true;
  }

  const currentSplit = currentPath.split('/').filter(d => d.length > 0);
  const previousSplit = previousPath.split('/').filter(d => d.length > 0);

  // If the second param isn't the same (Ex: /players/zezima and /players/psikoi)
  if (currentSplit.length > 1 && previousSplit.length > 1 && currentSplit[1] !== previousSplit[1]) {
    return true;
  }

  return false;
}

function onLocationChanged(currentPath, previousPath) {
  // If is different path (and not a different section of the same page),
  // scroll back to the top of the page
  if (shouldScrollToTop(currentPath, previousPath)) {
    window.scrollTo(0, 0);
  }

  const url = uniformUrl(currentPath);

  Analytics.set({ page: url });
  Analytics.pageview(url);
}

/**
 * Can't use useLocation from inside a component that
 * mounts the Route (App), so we have to create a wrapper
 * component, and use that to call useLocation.
 */
function AppWrapper({ children }) {
  const previousPathRef = useRef(null);
  const location = useLocation();

  useEffect(initGoogleAnalytics, []);

  useEffect(() => {
    onLocationChanged(location.pathname, previousPathRef.current);
    previousPathRef.current = location.pathname;
  }, [location]);

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Notification />
      <div className="content">
        <AppWrapper>
          <GlobalMessage message="The OSRS Hiscores are down since the 6th of January, causing WOM's updates to fail. Please check back in a few days." />
          <Switch>
            {ROUTES.map(({ path, component }) => (
              <Route key={path} exact path={path} component={component} />
            ))}
            <Route component={NotFound} />
          </Switch>
        </AppWrapper>
      </div>
    </BrowserRouter>
  );
}

export default App;
