import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

function useLazyLoading({ resultsPerPage, selector, action }) {
  const [pageIndex, setPageIndex] = useState(0);

  const data = useSelector(selector);
  const isFullyLoaded = data && data.length < resultsPerPage * (pageIndex + 1);

  const resetPagination = () => {
    setPageIndex(0);
  };

  const reloadData = () => {
    setPageIndex(0);
    loadMore();
  };

  const loadMore = () => {
    const limit = resultsPerPage;
    const offset = resultsPerPage * pageIndex;
    action(limit, offset);
  };

  const handleScrolling = () => {
    const margin = 300;

    window.onscroll = debounce(() => {
      // If has no more content to load, ignore the scrolling
      if (isFullyLoaded) {
        return;
      }

      const { innerHeight } = window;
      const { scrollTop, offsetHeight } = document.documentElement;

      // If has reached the bottom of the page, load more data
      if (innerHeight + scrollTop + margin > offsetHeight) {
        // This timeout is simply to wait for the scrolling
        // inertia to stop, to then load the contents, otherwise
        // it will resume the inertia and scroll to the bottom of the page again
        setTimeout(() => setPageIndex(i => i + 1), 1000);
      }
    }, 100);
  };

  useEffect(loadMore, [pageIndex]);
  useEffect(handleScrolling, [data, pageIndex]);

  return { data, isFullyLoaded, reloadData, resetPagination, pageIndex };
}

export default useLazyLoading;
