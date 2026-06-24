import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './Landing.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const container = useRef(null);
  const navigate = useNavigate();

  useGSAP(() => {
    // Hero Animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.to('.hero-title', {
      y: 0,
      opacity: 1,
      duration: 1.2,
      delay: 0.2
    })
    .to('.hero-subtitle', {
      y: 0,
      opacity: 1,
      duration: 1
    }, "-=0.8")
    .to('.hero-body', {
      y: 0,
      opacity: 1,
      duration: 1
    }, "-=0.8")
    .to('.hero-cta', {
      opacity: 1,
      duration: 0.8
    }, "-=0.6");

    // Unified entrance for features (no scroll trigger)
    gsap.to('.feature-card', {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.8
    });

  }, { scope: container });

  return (
    <div className={styles.container} ref={container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={`${styles.heroTitle} hero-title`}>Nest.</h1>
        <p className={`${styles.heroSubtitle} hero-subtitle`}>Shared living, simplified.</p>
        <p className={`${styles.heroBody} hero-body`}>
          A home should be a place of rest, not a source of stress. Keep track of expenses, coordinate groceries, and schedule chores—all in one place, so you and your roommates can focus on just living.
        </p>
        <div className={`${styles.ctaWrapper} hero-cta`}>
          <button className={styles.primaryBtn} onClick={() => navigate('/login')}>Get Started</button>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>Log In</button>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={`${styles.featuresGrid} features-grid`}>
          <div className={`${styles.featureCard} feature-card`}>
            <div className={styles.featureHeader}>
              <div className={styles.featureIcon}></div>
              <h3 className={styles.featureTitle}>Expenses</h3>
            </div>
            <p className={styles.featureDesc}>
              Split bills instantly. No more math, no more awkward conversations. Just fair, transparent tracking.
            </p>
          </div>
          <div className={`${styles.featureCard} feature-card`}>
            <div className={styles.featureHeader}>
              <div className={styles.featureIcon}></div>
              <h3 className={styles.featureTitle}>Chores</h3>
            </div>
            <p className={styles.featureDesc}>
              Keep the peace with automated chore schedules. Everyone does their part, effortlessly.
            </p>
          </div>
          <div className={`${styles.featureCard} feature-card`}>
            <div className={styles.featureHeader}>
              <div className={styles.featureIcon}></div>
              <h3 className={styles.featureTitle}>Groceries</h3>
            </div>
            <p className={styles.featureDesc}>
              A shared list that updates in real-time. Never buy milk twice again.
            </p>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className={`${styles.manifestoSection} manifesto-section`}>
        <h2 className={`${styles.manifestoText} manifesto-text`}>
          A home should be a place of rest, not a source of stress. We built Nest to manage the details, so you can just live.
        </h2>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Nest App. All rights reserved.</p>
      </footer>
    </div>
  );
}
