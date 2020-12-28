import React from 'react';
import PropTypes from 'prop-types';
import './TeamCard.scss';

function TeamCard({ team, onEditClicked, onDeleteClicked }) {
  return (
    <div className="team-card">
      <abbr title="Edit competition">
        <button className="edit-btn" type="button" onClick={() => onEditClicked(team)}>
          <img src="/img/icons/edit.svg" alt="" />
        </button>
      </abbr>
      <abbr title="Delete competition">
        <button className="delete-btn" type="button" onClick={() => onDeleteClicked(team)}>
          <img src="/img/icons/clear_red.svg" alt="" />
        </button>
      </abbr>
      <b className="title">{team.name}</b>
      {team.participants.map(p => (
        <div key={p} className="participant">
          <b className="participant__name">{p}</b>
        </div>
      ))}
    </div>
  );
}

TeamCard.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onEditClicked: PropTypes.func.isRequired,
  onDeleteClicked: PropTypes.func.isRequired
};

export default TeamCard;
