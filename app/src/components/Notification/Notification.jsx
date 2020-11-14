import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { appActions, appSelectors } from 'redux/app';
import './Notification.scss';

const config = {
  success: {
    className: '-success',
    icon: '/img/icons/check_green.svg',
    closeIcon: '/img/icons/clear_green.svg'
  },
  error: {
    className: '-error',
    icon: '/img/icons/error_red.svg',
    closeIcon: '/img/icons/clear_red.svg'
  },
  warn: {
    className: '-warn',
    icon: '/img/icons/warn_orange.svg',
    closeIcon: '/img/icons/clear_orange.svg'
  }
};

function Notification() {
  const dispatch = useDispatch();
  const visible = useSelector(appSelectors.isNotificationVisible);
  const notification = useSelector(appSelectors.getNotification);
  const { text, type, duration } = notification;

  const timer = useRef(null);

  const closeNotification = () => {
    dispatch(appActions.hideNotification());
  };

  const resetTimeout = () => {
    if (visible) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => closeNotification(), duration);
    }
  };

  // Auto-close the notification after the duration is over
  useEffect(resetTimeout, [visible, text, type, duration]);

  const notificationClass = classNames({
    notification: true,
    '-success': type === 'success',
    '-error': type === 'error',
    '-warn': type === 'warn',
    '-visible': visible
  });

  return (
    <div className="notification__container">
      <div className={notificationClass}>
        <img src={config[type].icon} alt="" />
        <span className="notification__text">{text}</span>
        <button className="notification__close" type="button" onClick={closeNotification}>
          <img src={config[type].closeIcon} alt="" />
        </button>
      </div>
    </div>
  );
}

export default React.memo(Notification);
