import clsx from 'clsx';
import React from 'react';
import styles from './Endpoint.module.css';

const Endpoint = props => {
  const { verb, path } = props;

  return (
    <div>
      <span className={clsx(styles.verb, styles[verb.toLowerCase()])}>{verb}</span>
      <span className={styles.path}>{path}</span>
    </div>
  );
};

export default Endpoint;
