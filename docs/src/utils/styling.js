import classNames from 'classnames';

export function dynamicClass(base, modifier) {
  return classNames({
    [base]: true,
    [`-${modifier}`]: true,
  });
}
