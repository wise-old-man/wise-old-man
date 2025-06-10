import React from 'react';
import { Redirect } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function IndexPage() {
  return <Redirect to={useBaseUrl('/api')} />;
}
