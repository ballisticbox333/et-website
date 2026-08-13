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
import standOnMower from './assets/work/stand-on-mower.jpg'
import pushMower from './assets/work/push-mower.jpg'

const phone = '904-775-0383'
const phoneHref = 'tel:+19047750383'

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

function HomePage() {
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
            <p className="eyebrow dark">Two Dedicated Crews</p>
            <h2>Choose the kind of care your property needs.</h2>
            <p>
              Our lawn maintenance and landscaping work are handled separately, so each crew can stay
              focused on delivering the right kind of service for your property.
            </p>
          </div>

          <div className="service-path-grid">
            <article className="service-path-card">
              <img src={sideLawn} alt="Clean, professionally maintained residential lawn" />
              <div>
                <p className="eyebrow">Lawn Maintenance</p>
                <h3>A consistently clean lawn without the weekend work.</h3>
                <p>
                  Dependable scheduled mowing, edging, weed eating, and cleanup with Basic and Full
                  Service packages available.
                </p>
                <a className="primary-button" href="#/lawn-maintenance">Explore Lawn Maintenance</a>
              </div>
            </article>
            <article className="service-path-card">
              <img src={rockMulchDesign} alt="Finished residential landscaping with rock, mulch, and flowers" />
              <div>
                <p className="eyebrow">Landscaping</p>
                <h3>Professional landscaping built around your property.</h3>
                <p>
                  Cleanups, trimming, mulch, rock, planting, drainage improvements, and complete
                  landscape transformations.
                </p>
                <a className="primary-button" href="#/landscaping">Explore Landscaping</a>
              </div>
            </article>
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

function InteriorHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header interior-header">
      <a className="brand" href="#/" aria-label="E.T. Custom Landscaping home">
        <img src={logo} alt="" />
        <span>E.T. Custom Landscaping</span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="interior-navigation"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>
      <nav id="interior-navigation" className={`site-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
        <a href="#/">Home</a>
        <a href="#/lawn-maintenance">Lawn Maintenance</a>
        <a href="#/landscaping">Landscaping</a>
        <a className="nav-mobile-call" href={phoneHref}>Talk About Your Property</a>
      </nav>
      <a className="header-call" href={phoneHref}>Talk About Your Property</a>
    </header>
  )
}

function InteriorFooter() {
  return (
    <footer className="site-footer">
      <img src={logo} alt="E.T. Custom Landscaping logo" />
      <p>Serving Duval County, St. Johns County, and the Beaches.</p>
      <a href={phoneHref}>{phone}</a>
    </footer>
  )
}

function LawnMaintenancePage() {
  return (
    <div className="site-shell interior-page">
      <InteriorHeader />
      <main>
        <section className="interior-hero lawn-hero">
          <div className="interior-hero-copy">
            <p className="eyebrow">Dedicated Lawn Maintenance</p>
            <h1>Lawn maintenance built around your property.</h1>
            <p>Reliable, professional lawn service for homeowners throughout Duval County, St. Johns County, and the Beaches. Choose the level of care you need and the mower that best suits your lawn.</p>
            <a className="primary-button" href={phoneHref}>Call to Discuss Your Lawn</a>
          </div>
        </section>

        <section className="section package-section">
          <div className="section-heading">
            <p className="eyebrow dark">Monthly Service Packages</p>
            <h2>Choose the right level of ongoing care.</h2>
            <p>Both packages keep the essential lawn work on a dependable schedule. Full Service adds care for the details around your landscape beds.</p>
          </div>
          <div className="package-grid">
            <article className="package-card">
              <p className="package-label">Basic Service</p>
              <p className="package-price"><span>Starting at</span>$165 <small>/ month</small></p>
              <p>Dependable routine service covering the essentials your lawn needs for a clean, finished appearance.</p>
              <ul><li>Mowing</li><li>Edging</li><li>Weed eating</li><li>Blowing off hard surfaces</li></ul>
              <a className="primary-button" href={phoneHref}>Ask About Basic Service</a>
            </article>
            <article className="package-card featured-package">
              <p className="package-label">Full Service</p>
              <p className="package-price"><span>Starting at</span>$185 <small>/ month</small></p>
              <p>Our more complete package for homeowners who want the lawn and landscape beds kept consistently presentable.</p>
              <ul><li>Everything in Basic Service</li><li>Hedge trimming</li><li>Weed control in landscape beds</li></ul>
              <a className="primary-button" href={phoneHref}>Ask About Full Service</a>
            </article>
          </div>
          <p className="pricing-note">Final monthly pricing depends on the property’s size, layout, access, condition, and maintenance needs. Push-mower service is available at an additional cost.</p>
        </section>

        <section className="section mower-section">
          <div className="section-heading">
            <p className="eyebrow dark">Choose Your Mowing Style</p>
            <h2>Professional equipment matched to your lawn.</h2>
          </div>
          <div className="mower-grid">
            <article className="mower-card premium-mower">
              <img src={pushMower} alt="Commercial push mower used by E.T. Custom Landscaping" />
              <div>
                <p className="eyebrow dark">Premium Option</p>
                <h3>Push-Mower Service</h3>
                <p>Our premium choice for homeowners who want a lighter, more controlled approach and a carefully detailed cut.</p>
                <ul><li>Excellent for smaller or detailed lawns</li><li>Better access around tighter spaces</li><li>Lighter equipment footprint</li><li>Clean, carefully controlled finish</li></ul>
                <p className="mower-note">Push-mower service costs more than standard stand-on mowing. Final pricing depends on the property.</p>
              </div>
            </article>
            <article className="mower-card">
              <img src={standOnMower} alt="Commercial stand-on mower used by E.T. Custom Landscaping" />
              <div>
                <p className="eyebrow dark">Standard Option</p>
                <h3>Stand-On Mower Service</h3>
                <p>Efficient professional mowing that produces a clean, consistent cut across lawns with room to maneuver.</p>
                <ul><li>Ideal for medium and larger lawns</li><li>Efficient coverage of open areas</li><li>Consistent commercial-quality mowing</li><li>Best overall value for routine service</li></ul>
              </div>
            </article>
          </div>
        </section>

        <section className="why-band">
          <p className="eyebrow">Why Homeowners Choose E.T.</p>
          <h2>Dependable service. Clean results. Clear communication.</h2>
          <p>Our lawn maintenance crew focuses specifically on ongoing property care. We pay attention to the finishing details and leave driveways, sidewalks, and other hard surfaces clean.</p>
        </section>

        <section className="contact-section interior-contact">
          <div className="contact-card">
            <p className="eyebrow dark">Let’s Find the Right Service</p>
            <h2>Compare packages and choose the right mowing style for your lawn.</h2>
            <div className="contact-actions"><a className="primary-button" href={phoneHref}>Call {phone}</a></div>
          </div>
        </section>
      </main>
      <InteriorFooter />
    </div>
  )
}

const landscapeServices = [
  ['Complete Landscape Projects', 'Transform an outdated, unfinished, or difficult area with a coordinated plan built around your property.'],
  ['Property Cleanups', 'Remove overgrowth, tired plant material, debris, and neglected areas to give the property a cleaner starting point.'],
  ['Tree and Hedge Trimming', 'Shape overgrown trees and hedges to restore cleaner lines and keep landscaping under control.'],
  ['Mulch Installation', 'Refresh landscape beds with new mulch, defined edges, and a clean finished appearance.'],
  ['Rock Installation', 'Create attractive, lower-maintenance landscape beds using rock selected to complement the property.'],
  ['Planting and Bed Improvements', 'Add Florida-appropriate plants, color, structure, and fresh bed layouts that improve the home’s presentation.'],
  ['Drainage and Irrigation Adjustments', 'Address water-flow problems and make practical irrigation adjustments that better support the property.'],
]

function LandscapingPage() {
  return (
    <div className="site-shell interior-page">
      <InteriorHeader />
      <main>
        <section className="interior-hero landscaping-hero">
          <div className="interior-hero-copy">
            <p className="eyebrow">Dedicated Landscaping Crew</p>
            <h1>Landscaping that makes your property look finished.</h1>
            <p>From focused refreshes to complete transformations, we improve curb appeal, solve problem areas, and create outdoor spaces that feel properly cared for.</p>
            <a className="primary-button" href={phoneHref}>Plan Your Landscape Project</a>
          </div>
        </section>

        <section className="section landscape-services-section">
          <div className="section-heading"><p className="eyebrow dark">Landscaping Services</p><h2>Practical improvements with a polished result.</h2></div>
          <div className="landscape-service-grid">
            {landscapeServices.map(([title, text]) => <article key={title}><span aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="project-approach">
          <div><p className="eyebrow">How We Approach Projects</p><h2>Clear communication from the first conversation through the final cleanup.</h2><p>We listen to what you want to improve, discuss practical options, and recommend an approach that fits the property. Our landscaping crew stays focused on the project while maintaining a clean job site and a professional finished result.</p></div>
          <img src={rockMulchDesign} alt="Finished rock, mulch, flower, and landscape bed project" />
        </section>

        <section className="section landscape-proof">
          <div className="section-heading"><p className="eyebrow dark">Real Project Results</p><h2>See the difference thoughtful landscaping can make.</h2></div>
          <div className="proof-grid">
            <img src={frontAfter} alt="Front landscape after redesign" />
            <img src={palmMulch} alt="Finished palm and mulch landscape" />
            <img src={frontLandscape} alt="Finished front landscaping project" />
          </div>
        </section>

        <section className="contact-section interior-contact">
          <div className="contact-card"><p className="eyebrow dark">Ready to Improve Your Property?</p><h2>Tell us what you want to change and we’ll talk through the right next step.</h2><div className="contact-actions"><a className="primary-button" href={phoneHref}>Talk About Your Property</a></div></div>
        </section>
      </main>
      <InteriorFooter />
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const updateRoute = () => {
      setRoute(window.location.hash)
      if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  if (route === '#/lawn-maintenance') return <LawnMaintenancePage />
  if (route === '#/landscaping') return <LandscapingPage />
  return <HomePage />
}

export default App
