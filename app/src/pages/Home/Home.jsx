import React from 'react';
import className from 'classnames';
import Button from '../../components/Button';
import './Home.scss';

const FEATURES = [
  {
    title: 'Player progress tracking',
    description: 'Track your progression overtime, browse your personal records and achievements.',
    image: '/img/landing_page/features/player_tracking.png'
  },
  {
    title: 'Efficiency metrics',
    description: "Measure your account's progress using updated effiency metrics.",
    image: '/img/landing_page/features/efficiency_metrics.png',
    unavailable: true
  },
  {
    title: 'Skill competitions',
    description: 'Compete against all your teammates in any skill of your choosing.',
    image: '/img/landing_page/features/team_competitions.png'
  },
  {
    title: 'Global leaderboards',
    description: 'Browse or compete with the community in the global record/gained leaderboards.',
    image: '/img/landing_page/features/leaderboards.png'
  }
];

function Home() {
  return (
    <div className="home__container">
      <section className="hero">
        <div className="hero__intro">
          <div className="intro-container">
            <span className="intro-greeting">Hi, meet the</span>
            <h1 className="intro-title">Wise Old Man</h1>
            <p className="intro-description">
              The open source Oldschool Runescape player progress tracker. PLEASE DELETE THIS
            </p>
            <Button text="Contribute" url="https://github.com/" />
          </div>
        </div>
        <div className="hero__illustration">
          <img src="/img/landing_page/hero_background.png" alt="" />
        </div>
      </section>
      <section className="about container">
        <div className="details row">
          <div className="details__info col-lg-7 col-md-12">
            <h1 className="section-title">What is it?</h1>
            <p className="description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sollicitudin gravida est
              ac tristique. Sed rhoncus eu sapien sed convallis.
              <br />
              <br />
              Nam blandit augue vel tortor ullamcorper posuere. Orci varius natoque penatibus et magnis
              dis parturient montes, nascetur ridiculus mus. Ut tempor dolor vel volutpat tempus.
            </p>
            <div className="info-actions">
              <Button
                className="-github-btn"
                text="Contribute on Github"
                icon="/img/icons/github.svg"
                url="https://github.com/"
              />
              <Button className="-discord-btn" text="Join our discord" icon="/img/icons/discord.svg" />
              <Button className="-twitter-btn" text="Follow on Twitter" icon="/img/icons/twitter.svg" />
            </div>
          </div>
          <div className="details__stats col-lg-5">
            <img src="/img/landing_page/trophies.png" alt="" />
          </div>
        </div>
        <div className="features row">
          {FEATURES.map(({ unavailable, title, image, description }) => (
            <div className={className({ 'feature-card': true, '-unavailable': unavailable })}>
              <img className="feature-card__image" src={image} alt="" />
              <div className="feature-card__info">
                <b className="feature-title">{title}</b>
                {unavailable && <span className="unavailable-label">Coming soon</span>}
                <p className="feature-description">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
