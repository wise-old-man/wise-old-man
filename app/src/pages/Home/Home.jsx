import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import './Home.scss';

const FEATURES = [
  {
    title: 'Experience tracking',
    page: '/players/Lynx_Titan', // Lynx Titan
    description:
      'Track your skilling progression overtime, browse your recent gains, personal records and more.',
    image: '/img/landing_page/features/player_tracking.png'
  },
  {
    title: 'Boss killcount tracking',
    page: '/top/general_graardor/', // Lynx Titan
    description: 'Track your boss kills and take your rightful place in the global PvM leaderboards.',
    image: '/img/landing_page/features/boss_tracking.png'
  },
  {
    title: 'Player achievements',
    page: '/players/Zulu/achievements',
    description: 'Reach your in-game goals to unlock your player achievements.',
    image: '/img/landing_page/features/efficiency_metrics.png'
  },
  {
    title: 'Discord Bot',
    url: 'https://bot.wiseoldman.net',
    description:
      "Track your clan's progress, competitions and achievements from your own Discord server.",
    image: '/img/landing_page/features/discord_bot.png'
  },
  {
    title: 'Group competitions',
    page: '/competitions',
    description: 'Compete against all your friends in any skill, boss or activity of your choosing.',
    image: '/img/landing_page/features/team_competitions.png'
  },
  {
    title: 'Global leaderboards',
    page: '/top',
    description: 'Browse or compete with the community in the global record/gained leaderboards.',
    image: '/img/landing_page/features/leaderboards.png'
  }
];

function Home() {
  function onScroll() {
    const { scrollY } = window;
    const hero = document.getElementById('hero');
    const intro = document.getElementById('intro');
    const illustration = document.getElementById('illustration');

    const scrollPercent = scrollY / (hero.offsetHeight * 0.6);

    intro.style.opacity = 1 - scrollPercent;
    intro.style.transform = `translateY(${scrollPercent * 50}px)`;

    illustration.style.opacity = 1 - scrollPercent;
    illustration.style.transform = `scale(${1 + scrollPercent * 0.05})`;
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home__container">
      <Helmet>
        <title>Wise Old Man - The Open Source Old School Runescape player progress tracker.</title>
      </Helmet>
      <section id="hero" className="hero">
        <div id="intro" className="hero__intro">
          <div className="intro-container">
            <span className="intro-greeting">Hi, meet the</span>
            <h1 className="intro-title">Wise Old Man</h1>
            <p className="intro-description">
              The Open Source Old School Runescape player progress tracker.
            </p>
            <div className="intro-cta">
              <Button
                className="secondary"
                text="Join our Discord"
                url="https://wiseoldman.net/discord"
              />
              <Button text="Contribute" url="https://wiseoldman.net/github" />
            </div>
            <a className="intro-update" href="https://bot.wiseoldman.net">
              <b className="update-new-tag">NEW!</b>
              <span className="update-title">The Wise Old Man Discord Bot!</span>
              <img className="update-icon" src="/img/icons/arrow_right.svg" alt="" />
            </a>
          </div>
        </div>
        <div id="illustration" className="hero__illustration">
          <img src="/img/landing_page/hero_background.png" alt="" />
        </div>
      </section>
      <section className="about container">
        <div className="details row">
          <div className="details__info col-lg-7 col-md-12">
            <h1 className="section-title">What is it?</h1>
            <p className="description">
              The Wise Old Man is an app that tracks your Old School Runescape player progress. Built on
              top of the OSRS hiscores, it allows you to keep track of your gains, participate in group
              competitions, collect achievements and much more.
              <br />
              <br />
              It is also a free Open Source project, meaning anyone in the community can contribute code
              or ideas to add new functionality. Please consider supporting us on Patreon so we can keep
              expanding and project without relying on &quot;premium&quot; features.
            </p>
            <div className="info-actions">
              <a href="https://wiseoldman.net/github" className="about-btn -github" role="button">
                <img className="about-btn__icon" src="/img/icons/github.svg" alt="github icon" />
                <span className="about-btn__text">Contribute on Github</span>
              </a>
              <a href="https://wiseoldman.net/discord" className="about-btn -discord" role="button">
                <img className="about-btn__icon" src="/img/icons/discord.svg" alt="discord icon" />
                <span className="about-btn__text">Join our discord</span>
              </a>
              <a href="https://wiseoldman.net/patreon" className="about-btn -patreon" role="button">
                <img className="about-btn__icon" src="/img/icons/patreon.svg" alt="patreon icon" />
                <span className="about-btn__text">Become a patron</span>
              </a>
            </div>
          </div>
          <div className="details__stats col-lg-5">
            <img src="/img/landing_page/trophies.png" alt="" />
          </div>
        </div>
        <div className="features row">
          {FEATURES.map(({ title, image, description, page, url }) => (
            <div key={title} className="feature-card">
              <img className="feature-card__image" src={image} alt="" />
              <div className="feature-card__info">
                {url && (
                  <a href={url}>
                    <b className="feature-title">{title}</b>
                  </a>
                )}
                {page && (
                  <Link to={page}>
                    <b className="feature-title">{title}</b>
                  </Link>
                )}
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
