import { createSelector } from 'reselect';

const rootSelector = state => state.rates;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetching = createSelector(rootSelector, root => root.isFetching);

export const getEHPRates = createSelector(rootSelector, root => root.ehpRates);
export const getEHBRates = createSelector(rootSelector, root => root.ehbRates);
