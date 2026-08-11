import './App.css'

import logo from './assets/ET-custom-logo.png'
import yardBefore from './assets/work/yard-renovation-before.png'
import yardAfter from './assets/work/yard-renovation-after.png'
import frontBefore from './assets/work/front-landscape-before.png'
import frontAfter from './assets/work/front-landscape-after.png'
import brushBefore from './assets/work/brush-cleanup-before.png'
import brushAfter from './assets/work/brush-cleanup-after.png'
import sideBefore from './assets/work/side-yard-before.png'
import sideAfter from './assets/work/side-yard-after.png'
import palmMulch from './assets/work/palm-mulch-bed.png'
import paverRock from './assets/work/paver-rock-landscape.png'
import backyardLawn from './assets/work/finished-backyard-lawn.png'
import walkwayRock from './assets/work/walkway-rock-bed.png'
import cleanBackyard from './assets/work/clean-backyard-maintenance.png'
import frontLawn from './assets/work/front-lawn-maintenance.png'
import curbsideLawn from './assets/work/curbside-lawn.png'
import frontRefresh from './assets/work/front-bed-refresh.png'

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
    title: 'Brush and Overgrowth Cleanup',
    before: brushBefore,
    after: brushAfter,
    text: 'Overgrown areas cleared back into usable, maintained space.',
  },
  {
    title: 'Side Yard Maintenance',
    before: sideBefore,
    after: sideAfter,
    text: 'Tight areas cleaned up with sharper lines and a finished cut.',
  },
]

const gallery = [
  { image: palmMulch, label: 'Mulch bed installation' },
  { image: paverRock, label: 'Rock and paver landscape' },
  { image: backyardLawn, label: 'Finished lawn maintenance' },
  { image: walkwayRock, label: 'Walkway rock bed' },
  { image: cleanBackyard, label: 'Backyard maintenance' },
  { image: frontLawn, label: 'Front lawn care' },
  { image: curbsideLawn, label: 'Curbside lawn cleanup' },
  { image: frontRefresh, label: 'Front bed refresh' },
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
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="E.T. Custom Landscaping home">
          <img src={logo} alt="" />
          <span>E.T. Custom Landscaping</span>
        </a>

        <nav className="site-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="header-call" href={phoneHref}>
          Call {phone}
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-media">
            <img src={frontAfter} alt="Finished front yard landscaping with rock beds and new plants" />
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
                Call {phone}
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
                    <img src={item.before} alt={`${item.title} before`} />
                    <figcaption>Before</figcaption>
                  </figure>
                  <figure>
                    <img src={item.after} alt={`${item.title} after`} />
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

        <section className="gallery-section" aria-labelledby="gallery-heading">
          <div className="section-heading">
            <p className="eyebrow">Finished Projects</p>
            <h2 id="gallery-heading">Clean lawns, finished beds, rock work, mulch, and property care.</h2>
          </div>

          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <figure className={index === 0 || index === 1 ? 'gallery-item wide' : 'gallery-item'} key={item.label}>
                <img src={item.image} alt={item.label} />
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
                Call {phone}
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
