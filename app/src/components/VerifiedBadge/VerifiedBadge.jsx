import React from 'react';
import './VerifiedBadge.scss';

function VerifiedBadge() {
  return (
    <abbr
      className="verified-badge"
      title="Verified group: This group's leader is verified on our Discord server."
    >
      <img src="/img/icons/verified.svg" alt="" />
    </abbr>
  );
}

export default VerifiedBadge;
