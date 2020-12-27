import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { times } from 'lodash';
import cn from 'classnames';
import './FormSteps.scss';

function FormSteps({ steps, currentIndex }) {
  return (
    <div className="form-steps__container">
      {times(steps, i => {
        const stepClass = cn('form-step', {
          '-current': currentIndex === i,
          '-completed': currentIndex > i
        });

        const separatorClass = cn('form-step-separator', {
          '-completed': currentIndex > i
        });

        return (
          <Fragment key={i}>
            <div className={stepClass}>{i + 1}</div>
            {i < steps - 1 && <div className={separatorClass} />}
          </Fragment>
        );
      })}
    </div>
  );
}

FormSteps.propTypes = {
  steps: PropTypes.number.isRequired,
  currentIndex: PropTypes.number.isRequired
};

export default FormSteps;
