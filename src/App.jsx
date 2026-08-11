import './App.css'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

import logo from './assets/ET-custom-logo.png'
import heroLandscape from './assets/work/hero-front-landscape.jpg'
import yardBefore from './assets/work/backyard-lawn-renovation-before.jpg'
import yardAfter from './assets/work/backyard-lawn-renovation-after.jpg'
import frontBefore from './assets/work/front-landscape-redesign-before.jpg'
import frontAfter from './assets/work/front-landscape-redesign-after.jpg'
import brushBefore from './assets/work/corner-lawn-restoration-before.jpg'
import brushAfter from './assets/work/corner-lawn-restoration-after.jpg'
import sideBefore from './assets/work/front-lawn-renewal-before.jpg'
import sideAfter from './assets/work/front-lawn-renewal-after.jpg'
import rockWalkway from './assets/work/finished-rock-walkway.jpg'
import sideLawn from './assets/work/finished-side-lawn.jpg'
import backyardSod from './assets/work/finished-backyard-sod.jpg'
import palmMulch from './assets/work/finished-palm-mulch.jpg'
import rockPaverBed from './assets/work/finished-rock-paver-bed.jpg'
import flowerBed from './assets/work/finished-flower-bed.jpg'
import frontLandscape from './assets/work/finished-front-landscape.jpg'
import treeBed from './assets/work/finished-tree-bed.jpg'
import rockMulchDesign from './assets/work/finished-rock-mulch-design.jpg'

const phone = '904-775-0383'
const phoneHref = 'tel:+19047750383'

const services = [
  'Landscape maintenance',
  'Property cleanups',
  'Tree and hedge trimming',
  'Mulch installation',
  'Rock installation',
  'Lawn care',
  'Drainage and irrigation adjustments',
  'Full landscaping projects',
]

const transformations = [
  {
    title: 'Backyard Lawn Renovation',
    before: yardBefore,
    after: yardAfter,
    text: 'From bare ground to a clean, green lawn with finished edges.',
  },
  {
    title: 'Front Landscape Refresh',
    before: frontBefore,
    after: frontAfter,
    text: 'Rock beds, fresh plants, defined borders, and better curb appeal.',
  },
  {
    title: 'Corner Lawn Restoration',
    before: brushBefore,
    after: brushAfter,
    text: 'A stripped, unfinished lawn restored with fresh sod and clean edges.',
  },
  {
    title: 'Front Lawn Renewal',
    before: sideBefore,
    after: sideAfter,
    text: 'A tired front lawn renewed with healthy green coverage and a finished curb line.',
  },
]

const gallery = [
  { image: rockWalkway, label: 'Finished rock walkway' },
  { image: sideLawn, label: 'Finished side lawn' },
  { image: backyardSod, label: 'Finished backyard sod' },
  { image: palmMulch, label: 'Palm and mulch landscape bed' },
  { image: rockPaverBed, label: 'Rock bed and paver landscape' },
  { image: flowerBed, label: 'Fresh flower bed installation' },
  { image: frontLandscape, label: 'Finished front landscaping' },
  { image: treeBed, label: 'Finished tree and flower bed' },
  { image: rockMulchDesign, label: 'Rock and mulch landscape design' },
]

const featuredPositions = [
  { column: 1, row: 1 },
  { column: 2, row: 1 },
  { column: 3, row: 1 },
  { column: 1, row: 2 },
  { column: 1, row: 2 },
  { column: 2, row: 2 },
  { column: 3, row: 2 },
  { column: 3, row: 2 },
  { column: 2, row: 2 },
]

const reviews = [
  {
    name: 'Kim B.',
    quote:
      'Tyler understood what I wanted and delivered more than I expected. He listened to what I wanted, provided options and communicated throughout the project... My yard has never looked so good and is virtually self-sustaining.',
  },
  {
    name: 'Tom W.',
    quote:
      'Tyler and his ET crew are professional landscapers and lawn caretakers, who take pride in their work. They and their work are first rate.',
  },
  {
    name: 'Martha M.',
    quote:
      'We are delighted with our new front landscaping installed by E T Landscaping... Tyler attacked the project, completed it on budget, and in a very tight time frame. The results are stunning!',
  },
  {
    name: 'Noah J.',
    quote:
      'We had a issue with water flooding our house due to improper drainage in our yard and he came out the very next day to help us out and give us solutions... He\'s professional, honest, and fair on pricing.',
  },
  {
    name: 'Maureen C.',
    quote:
      'I was amazed at how meticulous they were and their great attention to detail. Post project clean up was excellent—you’d never know they were here... Extremely pleasant and knowledgeable. Highly recommend.',
  },
  {
    name: 'Tharp R.',
    quote:
      'They bend over backwards to do little things that we have asked them to do and actually do extra things that we haven\'t asked them to do... When they leave the place is spotless... They really take pride in their work.',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [featuredPhoto, setFeaturedPhoto] = useState(0)
  const [expandedPhoto, setExpandedPhoto] = useState(null)

  const closeMenu = () => setMenuOpen(false)

  const featurePhoto = (index) => {
    if (index === featuredPhoto) return

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setFeaturedPhoto(index))
      })
      return
    }

    setFeaturedPhoto(index)
  }

  useEffect(() => {
    if (!expandedPhoto) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setExpandedPhoto(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [expandedPhoto])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="E.T. Custom Landscaping home">
          <img src={logo} alt="" />
          <span>E.T. Custom Landscaping</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-navigation" className={`site-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#work" onClick={closeMenu}>Work</a>
          <a href="#reviews" onClick={closeMenu}>Reviews</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a className="nav-mobile-call" href={phoneHref} onClick={closeMenu}>Talk About Your Property</a>
        </nav>

        <a className="header-call" href={phoneHref}>
          Talk About Your Property
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-media">
            <img src={heroLandscape} alt="Finished front yard landscaping with palm, rock beds, shrubs, and flowers" />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">Duval County, St. Johns County, and the Beaches</p>
            <h1>
              <span>Full-Service</span>
              <span>Landscaping</span>
              <span>Built Around</span>
              <span>Your Property</span>
            </h1>
            <p className="hero-copy">
              Maintenance, cleanups, trimming, mulch, rock, lawn care, drainage help, and full landscape
              projects handled by a local crew that keeps the finished result sharp.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href={phoneHref}>
                Plan Your Landscape Project
              </a>
              <a className="secondary-button" href="#work">
                See Our Work
              </a>
            </div>
          </div>
        </section>

        <section className="intro-band" aria-label="Company highlights">
          <div>
            <strong>Local Service</strong>
            <span>Serving Northeast Florida neighborhoods, homes, and outdoor spaces.</span>
          </div>
          <div>
            <strong>Complete Care</strong>
            <span>Dedicated lawn maintenance and landscaping crews, each focused on doing their work right.</span>
          </div>
          <div>
            <strong>Real Results</strong>
            <span>Before-and-after transformations backed by customer reviews.</span>
          </div>
        </section>

        <section className="section services-section" id="services">
          <div className="section-heading">
            <p className="eyebrow dark">What We Do</p>
            <h2>Everything your landscape needs to look its best.</h2>
            <p>
              From dependable lawn maintenance to complete landscape transformations, our dedicated
              crews bring the right focus and experience to every property.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <div className="service-card" key={service}>
                <h3>{service}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="section transformations-section" id="work">
          <div className="section-heading split">
            <div>
              <p className="eyebrow dark">Before & After</p>
              <h2>See what a professionally cared-for property can become.</h2>
            </div>
            <p>
              Real transformations. Fresh curb appeal. Outdoor spaces made cleaner, sharper, and ready
              to enjoy.
            </p>
          </div>

          <div className="transformation-grid">
            {transformations.map((item) => (
              <article className="transformation-card" key={item.title}>
                <div className="before-after">
                  <figure>
                    <button type="button" onClick={() => setExpandedPhoto({ image: item.before, label: `${item.title} before` })} aria-label={`Enlarge ${item.title} before photo`}>
                      <img src={item.before} alt={`${item.title} before`} />
                    </button>
                    <figcaption>Before</figcaption>
                  </figure>
                  <figure>
                    <button type="button" onClick={() => setExpandedPhoto({ image: item.after, label: `${item.title} after` })} aria-label={`Enlarge ${item.title} after photo`}>
                      <img src={item.after} alt={`${item.title} after`} />
                    </button>
                    <figcaption>After</figcaption>
                  </figure>
                </div>
                <div className="transformation-copy">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {expandedPhoto && (
          <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={expandedPhoto.label} onClick={() => setExpandedPhoto(null)}>
            <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
              <button className="lightbox-close" type="button" onClick={() => setExpandedPhoto(null)} autoFocus aria-label="Close enlarged photo">
                ×
              </button>
              <img src={expandedPhoto.image} alt={expandedPhoto.label} />
            </div>
          </div>
        )}

        <section className="gallery-section" aria-labelledby="gallery-heading">
          <div className="section-heading">
            <p className="eyebrow">Finished Projects</p>
            <h2 id="gallery-heading">Clean lawns, finished beds, rock work, mulch, and property care.</h2>
          </div>

          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <figure
                className={`gallery-item${featuredPhoto === index ? ' featured' : ''}`}
                key={item.label}
                style={{
                  viewTransitionName: `gallery-photo-${index}`,
                  '--feature-column': featuredPositions[index].column,
                  '--feature-row': featuredPositions[index].row,
                }}
              >
                <button
                  className="gallery-button"
                  type="button"
                  onClick={() => featurePhoto(index)}
                  aria-label={`Feature ${item.label} as the large gallery photo`}
                  aria-pressed={featuredPhoto === index}
                >
                  <img src={item.image} alt={item.label} />
                </button>
              </figure>
            ))}
          </div>
        </section>

        <section className="section reviews-section" id="reviews">
          <div className="section-heading split">
            <div>
              <p className="eyebrow dark">Customer Reviews</p>
              <h2>Trusted for communication, fair pricing, and finished results.</h2>
            </div>
            <p>
              Excerpts from real Google reviews. Ellipses show where longer reviews have been shortened
              for display.
            </p>
          </div>

          <div className="review-grid">
            {reviews.map((review) => (
              <figure className="review-card" key={review.name}>
                <div className="stars" aria-label="5 out of 5 stars">
                  <span aria-hidden="true">★★★★★</span>
                </div>
                <blockquote>{review.quote}</blockquote>
                <figcaption>{review.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="service-area-section" aria-labelledby="service-area-heading">
          <div>
            <p className="eyebrow">Service Area</p>
            <h2 id="service-area-heading">Serving Duval County, St. Johns County, and the Beaches.</h2>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-card">
            <p className="eyebrow dark">Ready for a cleaner property?</p>
            <h2>Call E.T. Custom Landscaping for maintenance, cleanups, trimming, mulch, rock, and more.</h2>
            <p>
              Tell us what your property needs and we will talk through the right next step for your yard.
              We serve Duval County, St. Johns County, and the Beaches.
            </p>
            <div className="contact-actions">
              <a className="primary-button" href={phoneHref}>
                Schedule Lawn Service
              </a>
              <a className="secondary-button dark" href="https://www.facebook.com/etcustomlandscaping" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a className="secondary-button dark" href="https://www.instagram.com/etcustomlandscaping/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <img src={logo} alt="E.T. Custom Landscaping logo" />
        <p>Full-service landscaping across Duval County, St. Johns County, and the Beaches.</p>
        <a href={phoneHref}>{phone}</a>
      </footer>
    </div>
  )
}

export default App
