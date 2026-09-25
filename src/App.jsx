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
import singleOperatorPattern from './assets/training/single-operator-mowing-pattern.png'
import twoOperatorStandardPattern from './assets/training/two-operator-standard-pattern.png'
import twoOperatorFencedPattern from './assets/training/two-operator-fenced-pattern.png'
import twoOperatorAdjacentPattern from './assets/training/two-operator-adjacent-pattern.png'

const phone = '904-775-0383'
const phoneHref = 'tel:+19047750383'
const email = 'ETCustomLandscaping@gmail.com'
const generalContactHref = '#/contact'
const lawnContactHref = '#/contact?service=lawn-maintenance'
const landscapingContactHref = '#/contact?service=landscaping'
const applicationEndpoint = ''

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
          <a className="nav-mobile-call" href={generalContactHref} onClick={closeMenu}>Contact Us</a>
        </nav>

        <a className="header-call" href={generalContactHref}>
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
              <a className="primary-button" href={landscapingContactHref}>
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
              <a className="primary-button" href={lawnContactHref}>
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
        <a href={generalContactHref}>{phone}</a>
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
        <a className="nav-mobile-call" href={generalContactHref}>Contact Us</a>
      </nav>
      <a className="header-call" href={generalContactHref}>Talk About Your Property</a>
    </header>
  )
}

function InteriorFooter() {
  return (
    <footer className="site-footer">
      <img src={logo} alt="E.T. Custom Landscaping logo" />
      <p>Serving Duval County, St. Johns County, and the Beaches.</p>
      <a href={generalContactHref}>{phone}</a>
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
            <a className="primary-button" href={lawnContactHref}>Discuss Your Lawn</a>
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
              <a className="primary-button" href={lawnContactHref}>Ask About Basic Service</a>
            </article>
            <article className="package-card featured-package">
              <p className="package-label">Full Service</p>
              <p className="package-price"><span>Starting at</span>$185 <small>/ month</small></p>
              <p>Our more complete package for homeowners who want the lawn and landscape beds kept consistently presentable.</p>
              <ul><li>Everything in Basic Service</li><li>Hedge trimming</li><li>Weed control in landscape beds</li></ul>
              <a className="primary-button" href={lawnContactHref}>Ask About Full Service</a>
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
            <div className="contact-actions"><a className="primary-button" href={lawnContactHref}>Choose How to Contact Us</a></div>
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
            <a className="primary-button" href={landscapingContactHref}>Plan Your Landscape Project</a>
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
          <div className="contact-card"><p className="eyebrow dark">Ready to Improve Your Property?</p><h2>Tell us what you want to change and we’ll talk through the right next step.</h2><div className="contact-actions"><a className="primary-button" href={landscapingContactHref}>Talk About Your Property</a></div></div>
        </section>
      </main>
      <InteriorFooter />
    </div>
  )
}

const serviceLabels = {
  'lawn-maintenance': 'Lawn Maintenance',
  landscaping: 'Landscaping',
}

function ContactPage({ initialService, initialMethod }) {
  const [service, setService] = useState(serviceLabels[initialService] ? initialService : '')
  const [emailForm, setEmailForm] = useState({
    name: '',
    phoneNumber: '',
    propertyAddress: '',
    message: '',
  })

  const selectedService = serviceLabels[service] || 'lawn maintenance or landscaping services'
  const textMessage = `Hi E.T. Custom Landscaping! I'm interested in ${selectedService.toLowerCase()}. I'd like to talk about my property.`
  const textHref = `sms:+19047750383?body=${encodeURIComponent(textMessage)}`

  useEffect(() => {
    if (initialMethod !== 'email') return undefined
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('email-questionnaire')?.scrollIntoView({ behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [initialMethod])

  const updateEmailField = (event) => {
    const { name, value } = event.target
    setEmailForm((current) => ({ ...current, [name]: value }))
  }

  const prepareEmail = (event) => {
    event.preventDefault()
    const subject = `Website inquiry: ${serviceLabels[service]}`
    const body = [
      'Hello E.T. Custom Landscaping,',
      '',
      `Name: ${emailForm.name}`,
      `Phone: ${emailForm.phoneNumber}`,
      `Property address: ${emailForm.propertyAddress}`,
      `Service requested: ${serviceLabels[service]}`,
      '',
      'Message:',
      emailForm.message,
    ].join('\n')

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="contact-page">
      <header className="application-header">
        <a className="brand" href="#/" aria-label="E.T. Custom Landscaping home">
          <img src={logo} alt="" />
          <span>E.T. Custom Landscaping</span>
        </a>
        <span className="application-header-label">Contact Our Team</span>
      </header>

      <main className="contact-page-main">
        <section className="contact-page-intro" aria-labelledby="contact-page-title">
          <p className="eyebrow">Let’s Talk About Your Property</p>
          <h1 id="contact-page-title">Call, text, or send us an email.</h1>
          <p>Choose what you need and the easiest way to reach us. Text messages are always welcome.</p>
        </section>

        <section className="contact-preference-card" aria-label="Contact options">
          <div className="contact-method-grid">
            <article className="contact-method-card">
              <p className="contact-method-number">01</p>
              <h2>Call</h2>
              <p>Speak with us directly about your property and the service you need.</p>
              <a className="contact-method-button" href={phoneHref}>Call {phone}</a>
            </article>

            <article className="contact-method-card featured-contact-method">
              <p className="contact-method-number">02</p>
              <h2>Text</h2>
              <p>Text messages are welcome. We’ll start one with a short message already filled in.</p>
              <a className="contact-method-button" href={textHref}>Text {phone}</a>
            </article>

            <article className="contact-method-card">
              <p className="contact-method-number">03</p>
              <h2>Email</h2>
              <p>Answer a few quick questions below and we’ll prepare the email for you.</p>
              <button className="contact-method-button contact-method-jump" type="button" onClick={() => document.getElementById('email-questionnaire')?.scrollIntoView({ behavior: 'smooth' })}>Prepare an Email</button>
            </article>
          </div>
        </section>

        <section className="contact-email-section" id="email-questionnaire" aria-labelledby="email-questionnaire-title">
          <div className="contact-email-heading">
            <p className="eyebrow dark">Email Questionnaire</p>
            <h2 id="email-questionnaire-title">Tell us what your property needs.</h2>
            <p>When you continue, your email app will open with these details addressed to {email}. Nothing is sent until you review the email and press Send.</p>
          </div>

          <form className="contact-email-form" onSubmit={prepareEmail}>
            <div className="contact-email-field">
              <label htmlFor="contactName">Name</label>
              <input id="contactName" name="name" type="text" autoComplete="name" value={emailForm.name} onChange={updateEmailField} required />
            </div>
            <div className="contact-email-field">
              <label htmlFor="contactPhone">Phone number</label>
              <input id="contactPhone" name="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" value={emailForm.phoneNumber} onChange={updateEmailField} required />
            </div>
            <div className="contact-email-field contact-email-wide">
              <label htmlFor="propertyAddress">Property address</label>
              <input id="propertyAddress" name="propertyAddress" type="text" autoComplete="street-address" value={emailForm.propertyAddress} onChange={updateEmailField} required />
            </div>
            <div className="contact-email-field contact-email-wide">
              <label htmlFor="emailService">Service</label>
              <select id="emailService" value={service} onChange={(event) => setService(event.target.value)} required>
                <option value="">Choose a service</option>
                <option value="lawn-maintenance">Lawn Maintenance</option>
                <option value="landscaping">Landscaping</option>
              </select>
            </div>
            <div className="contact-email-field contact-email-wide">
              <label htmlFor="contactMessage">How can we help?</label>
              <textarea id="contactMessage" name="message" rows="7" value={emailForm.message} onChange={updateEmailField} placeholder="Tell us about the property, what you would like done, and any questions you have." required />
            </div>
            <div className="contact-email-submit contact-email-wide">
              <button type="submit">Open My Email</button>
              <p>You’ll have a chance to review everything before sending.</p>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

const applicationQuestions = [
  {
    id: 'pastMistake',
    label: 'Tell us about a mistake you made at a past job. What happened, and what did you learn from it?',
  },
  {
    id: 'workplaceDisagreement',
    label: 'Tell us about a time you disagreed with a boss, manager, or coworker about how something should be done. How did you handle it?',
  },
  {
    id: 'taskTracking',
    label: 'How do you personally make sure important tasks do not get forgotten or skipped?',
  },
  {
    id: 'feedbackPreference',
    label: 'How do you prefer to receive feedback or correction?',
  },
  {
    id: 'outdoorExperience',
    label: 'How much experience do you have in lawn maintenance or working outdoors in Florida?',
  },
  {
    id: 'workStyle',
    label: 'Do you work better individually or as part of a team? Please explain.',
  },
  {
    id: 'availability',
    label: 'What is your availability? Please include the days and times you can work.',
  },
  {
    id: 'machineryExperience',
    label: 'What machinery are you proficient in? What are your weak spots?',
  },
]

function ApplicationPage() {
  const [submissionState, setSubmissionState] = useState('idle')

  const submitApplication = async (event) => {
    event.preventDefault()

    if (!applicationEndpoint) {
      setSubmissionState('not-connected')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append('submittedAt', new Date().toISOString())
    setSubmissionState('submitting')

    try {
      await fetch(applicationEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(formData),
      })
      form.reset()
      setSubmissionState('success')
    } catch {
      setSubmissionState('error')
    }
  }

  return (
    <div className="application-page">
      <header className="application-header">
        <a className="brand" href="#/" aria-label="E.T. Custom Landscaping home">
          <img src={logo} alt="" />
          <span>E.T. Custom Landscaping</span>
        </a>
        <span className="application-header-label">Employment Application</span>
      </header>

      <main className="application-main">
        <section className="application-intro" aria-labelledby="application-title">
          <p className="eyebrow">Join Our Team</p>
          <h1 id="application-title">Application Questionnaire</h1>
          <p>Tell us about your experience, availability, and how you approach your work. Please answer every question thoughtfully.</p>
        </section>

        <form className="application-form" onSubmit={submitApplication}>
          <input type="hidden" name="source" value="Indeed application page" />

          <div className="application-field">
            <label htmlFor="fullName">Please fill out your name.</label>
            <input id="fullName" name="fullName" type="text" autoComplete="name" required />
          </div>

          <div className="application-field">
            <label htmlFor="phoneNumber">Please provide your phone number.</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" required />
          </div>

          {applicationQuestions.map((question) => (
            <div className="application-field" key={question.id}>
              <label htmlFor={question.id}>{question.label}</label>
              <textarea id={question.id} name={question.id} rows="5" required />
            </div>
          ))}

          <div className="application-submit-area">
            <p>Review your answers before submitting. All fields are required.</p>
            <button className="application-submit" type="submit" disabled={submissionState === 'submitting'}>
              {submissionState === 'submitting' ? 'Submitting…' : 'Submit Application'}
            </button>
            <div className="application-status" aria-live="polite">
              {submissionState === 'not-connected' && (
                <p className="status-notice">Online submissions are not connected yet. Your answers are still on this page and have not been sent.</p>
              )}
              {submissionState === 'success' && (
                <p className="status-success">Thank you. Your application has been submitted.</p>
              )}
              {submissionState === 'error' && (
                <p className="status-error">Your application could not be submitted. Please check your connection and try again.</p>
              )}
            </div>
          </div>
        </form>

        <p className="application-privacy">The information you provide will be used only to review your application with E.T. Custom Landscaping.</p>
      </main>
    </div>
  )
}

const trainingTopics = [
  {
    id: 'mowing',
    title: 'Mowing',
    description: 'Mower setup, safe operation, cutting patterns, and a clean finished lawn.',
    available: true,
  },
  {
    id: 'blowing',
    title: 'Blowing',
    description: 'Clean hard surfaces, beds, and final-pass expectations.',
  },
  {
    id: 'edging',
    title: 'Edging',
    description: 'Straight, consistent edges along concrete, beds, and property lines.',
  },
  {
    id: 'hedge-trimming',
    title: 'Hedge Trimming',
    description: 'Shape, height, cleanup, and careful work around the property.',
  },
  {
    id: 'weedeating',
    title: 'Weedeating',
    description: 'Detail work around obstacles and areas the mower cannot safely reach.',
  },
]

function TrainingHeader() {
  return (
    <header className="training-header">
      <a className="brand" href="#/" aria-label="E.T. Custom Landscaping home">
        <img src={logo} alt="" />
        <span>E.T. Custom Landscaping</span>
      </a>
      <span className="training-header-label">Crew Training</span>
    </header>
  )
}

function TrainingPage() {
  return (
    <div className="training-page">
      <TrainingHeader />
      <main className="training-main">
        <section className="training-intro" aria-labelledby="training-title">
          <p className="eyebrow">Training Library</p>
          <h1 id="training-title">Choose a training section.</h1>
          <p>Select a topic to review the E.T. Custom Landscaping process and expectations for that part of the job.</p>
        </section>

        <nav className="training-topic-grid" aria-label="Training topics">
          {trainingTopics.map((topic, index) => (
            <a
              className={`training-topic-card${topic.available ? ' training-topic-available' : ''}`}
              href={`#/training/${topic.id}`}
              key={topic.id}
            >
              <span className="training-topic-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="training-topic-copy">
                <strong>{topic.title}</strong>
                <span>{topic.description}</span>
              </span>
              <span className="training-topic-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </nav>
      </main>
    </div>
  )
}

function TrainingDiagram({ src, alt, caption }) {
  return (
    <figure className="training-diagram">
      <a href={src} target="_blank" rel="noreferrer" aria-label={`Open full-size diagram: ${alt}`}>
        <img src={src} alt={alt} />
      </a>
      <figcaption>{caption} <span>Tap the diagram to open it full size.</span></figcaption>
    </figure>
  )
}

function MowingTrainingPage() {
  return (
    <div className="training-page">
      <TrainingHeader />
      <main className="training-main mowing-training-main">
        <a className="training-back-link" href="#/training">← All training sections</a>

        <section className="training-intro mowing-training-intro" aria-labelledby="mowing-training-title">
          <p className="eyebrow">Crew Training</p>
          <h1 id="mowing-training-title">Mowing Training</h1>
          <p>The goal when mowing is simple: produce a clean, consistent cut while moving through the property efficiently.</p>
          <p>The diagrams in this section show our standard mowing patterns. These patterns should normally be followed, but the route leader may change the mowing order or divide the work differently when the property layout or situation calls for it.</p>
        </section>

        <nav className="training-section-nav" aria-label="Mowing training sections">
          <a href="#mowing-standards">Basic Standards</a>
          <a href="#single-operator">Single Operator</a>
          <a href="#two-standard">Two Operators</a>
          <a href="#fenced-yard">Fenced Backyard</a>
          <a href="#adjacent-properties">Adjacent Properties</a>
          <a href="#main-rule">Main Rule</a>
        </nav>

        <section className="mowing-section" id="mowing-standards">
          <div className="mowing-section-heading">
            <p className="eyebrow dark">The Foundation</p>
            <h2>Basic Mowing Standards</h2>
          </div>
          <div className="mowing-standard-grid">
            <article>
              <span>01</span>
              <h3>Treat the lawn as sections</h3>
              <p>Break the lawn into logical squares or rectangles whenever possible.</p>
              <p>Front yards, side yards, backyards, sidewalk strips, and other separated areas should generally be treated as individual mowing sections.</p>
              <p>Finish the section you are working on before moving unnecessarily to another area.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Outline first</h3>
              <p>Before filling in a section, make at least one outline pass around its perimeter.</p>
              <p>This gives you room to turn, helps establish the section, and makes the finished result cleaner.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Fill with straight passes</h3>
              <p>After outlining the section, fill the inside using straight back-and-forth passes.</p>
              <p>Avoid random movements or unnecessary changes in direction.</p>
            </article>
            <article>
              <span>04</span>
              <h3>Overlap your passes</h3>
              <p>Each mowing pass should slightly overlap the previous one.</p>
              <p>Do not try to place the very edge of the mower directly beside the previous pass. A small overlap prevents thin strips of uncut grass from being left behind.</p>
            </article>
            <article>
              <span>05</span>
              <h3>Leave appropriate clearance</h3>
              <p>Do not mow excessively close to fences, houses, landscaping, trees, vehicles, air conditioners, or other obstacles.</p>
              <p>Leave enough room to prevent damage to the mower or the property. Areas that cannot be safely reached with the mower can be handled during trimming.</p>
            </article>
            <article>
              <span>06</span>
              <h3>Minimize unnecessary crossings</h3>
              <p>Avoid repeatedly crossing sidewalks, driveways, and already-completed areas.</p>
              <p>Plan your route so that the mower continues naturally from one section into the next.</p>
            </article>
          </div>
        </section>

        <section className="mowing-section mowing-pattern-section" id="single-operator">
          <div className="mowing-copy">
            <p className="eyebrow dark">One Mower</p>
            <h2>Single-Operator Mowing</h2>
            <p>When one person is mowing the property, the goal is to create one continuous route around the lawn.</p>
            <p>Start with the section closest to the street, work through the front yard, continue around one side of the house, complete the backyard, and finish on the opposite side.</p>
            <p>The exact direction may change depending on the property, but unnecessary backtracking and repeated crossings should be avoided.</p>
            <ul>
              <li>Treat each area as its own section.</li>
              <li>Outline the section first.</li>
              <li>Fill it with straight passes.</li>
              <li>Move naturally from one section into the next.</li>
              <li>Minimize unnecessary crossings of sidewalks and driveways.</li>
            </ul>
          </div>
          <TrainingDiagram
            src={singleOperatorPattern}
            alt="Single-operator mowing pattern showing a continuous route through seven lawn sections"
            caption="Standard single-operator route"
          />
        </section>

        <section className="mowing-section mowing-pattern-section reverse" id="two-standard">
          <TrainingDiagram
            src={twoOperatorStandardPattern}
            alt="Two-operator mowing pattern showing operators starting apart and meeting in the backyard"
            caption="Standard two-operator property pattern"
          />
          <div className="mowing-copy">
            <p className="eyebrow dark">Two Mowers</p>
            <h2>Two Operators — Standard Property</h2>
            <p>When two people are mowing the same property, they should begin as far apart from each other as reasonably possible.</p>
            <p>Each mower works through their side of the property independently rather than following the other mower around.</p>
            <p>Both operators continue mowing toward the remaining unfinished area until their work meets. There is no reason for one mower to wait for the other.</p>
            <p>On a typical property, each mower handles one side of the front and side yards before both eventually reach the backyard.</p>
            <p>Once both operators are in the backyard, they work together to finish it.</p>
            <p>Near the end, if only a small amount of mowing remains, one operator may leave the other to finish and begin the next task, such as blowing.</p>
            <p>The goal is to keep everyone productive rather than having two people finish the final few mower passes unnecessarily.</p>
          </div>
        </section>

        <section className="mowing-section mowing-pattern-section" id="fenced-yard">
          <div className="mowing-copy">
            <p className="eyebrow dark">One Gate</p>
            <h2>Two Operators — Fenced Backyard</h2>
            <p>A fenced backyard changes where the operators should begin, but the same basic principle applies:</p>
            <p className="mowing-callout"><strong>Start as far apart as possible and work toward each other.</strong></p>
            <p>If the backyard has only one gate, one operator can begin inside the fenced backyard while the other begins outside the fence on the opposite side.</p>
            <p>The operator inside the fence works through the backyard and exits through the gate. The other operator works around the outside of the house.</p>
            <p>The gate may be on either side of the property. The pattern can simply be mirrored.</p>
            <p>There is no designated meetup point. Whichever mower reaches unfinished grass continues mowing it.</p>
            <p>The important idea is that both employees remain productive and gradually work toward each other until the entire property is complete.</p>
          </div>
          <TrainingDiagram
            src={twoOperatorFencedPattern}
            alt="Two-operator mowing pattern for a property with a fenced backyard and one gate"
            caption="Two-operator pattern for a fenced backyard"
          />
        </section>

        <section className="mowing-section mowing-pattern-section reverse" id="adjacent-properties">
          <TrainingDiagram
            src={twoOperatorAdjacentPattern}
            alt="Two-operator mowing pattern divided across multiple adjacent properties"
            caption="Two-operator pattern for adjacent properties"
          />
          <div className="mowing-copy">
            <p className="eyebrow dark">Several Homes</p>
            <h2>Two Operators — Multiple Adjacent Properties</h2>
            <p>When several neighboring properties are being mowed together, dividing the work by area can be more efficient than having both operators completely finish one house before moving to the next.</p>
            <p>One operator can primarily handle the front yards while the other primarily handles the backyards.</p>
            <h3>Front-yard operator</h3>
            <p>The front-yard operator begins at one end of the group and works through the front sections in order.</p>
            <p>Complete each logical section before moving to the next. Grass between the sidewalk and road is part of the lawn and should be included.</p>
            <h3>Backyard operator</h3>
            <p>The backyard operator begins from the opposite end and works through the backyards.</p>
            <p>Large backyards can be divided into smaller logical squares or rectangles. There is no requirement that every backyard be divided exactly the same way. Use sections that make sense for the property.</p>
            <h3>Side yards</h3>
            <p>The route leader decides who is responsible for the side yards. The assignment should be based on what makes the overall mowing pattern most efficient.</p>
            <p>Whoever is responsible for a side yard should normally mow it when they are already closest to it rather than returning later.</p>
          </div>
        </section>

        <section className="mowing-section mowing-finish-section">
          <div className="mowing-section-heading">
            <p className="eyebrow dark">Keep Moving</p>
            <h2>When One Mower Finishes First</h2>
          </div>
          <div className="mowing-finish-card">
            <p>Operators should not stop working simply because their original assignment is complete.</p>
            <p>When one mower finishes first, they begin helping the other mower from the opposite end of the unfinished work.</p>
            <p>For example, if the front-yard operator finishes first, they begin helping with the highest-numbered unfinished backyard section.</p>
            <p>If the backyard operator finishes first, they begin helping with the highest-numbered unfinished side or front section.</p>
            <p>Both operators then continue working toward each other until all mowing is complete.</p>
            <strong>The exact place where they meet does not matter.</strong>
          </div>
        </section>

        <section className="mowing-main-rule" id="main-rule">
          <p className="eyebrow">The Main Rule</p>
          <h2>Understand the system. Apply it to the property.</h2>
          <p>The diagrams are the standard procedure, but they are not meant to replace common sense. The route leader may change the pattern when necessary.</p>
          <p>Different properties will have different shapes, fences, gates, landscaping, slopes, obstacles, and amounts of grass.</p>
          <ul>
            <li>Divide the lawn into logical sections.</li>
            <li>Outline before filling.</li>
            <li>Use straight, slightly overlapping passes.</li>
            <li>Avoid getting unnecessarily close to obstacles.</li>
            <li>Minimize unnecessary crossings and travel.</li>
            <li>Start multiple mowers far apart.</li>
            <li>Keep everyone working.</li>
            <li>When your assigned work is finished, help complete the remaining work from the opposite end.</li>
            <li>Follow the route leader&apos;s instructions when the standard pattern needs to be adjusted.</li>
          </ul>
          <div className="mowing-rule-finish">
            <strong>The goal is not to copy a diagram perfectly.</strong>
            <span>The goal is to understand the system well enough to apply it efficiently to any property.</span>
          </div>
        </section>
      </main>
    </div>
  )
}

function TrainingTopicPage({ topicId }) {
  const topic = trainingTopics.find((item) => item.id === topicId)

  if (!topic) return <TrainingPage />
  if (topicId === 'mowing') return <MowingTrainingPage />

  return (
    <div className="training-page">
      <TrainingHeader />
      <main className="training-main">
        <a className="training-back-link" href="#/training">← All training sections</a>
        <section className="training-intro training-topic-intro" aria-labelledby="training-topic-title">
          <p className="eyebrow">Crew Training</p>
          <h1 id="training-topic-title">{topic.title}</h1>
          <p>{topic.available ? 'This training section is ready for the mowing material we add next.' : 'Training material for this section will be added soon.'}</p>
        </section>
        <section className="training-placeholder" aria-label={`${topic.title} training status`}>
          <span>{topic.available ? 'Next up' : 'Coming soon'}</span>
          <h2>{topic.available ? 'Build the mowing training.' : `${topic.title} training`}</h2>
          <p>{topic.available ? 'We can add the mowing steps, photos, videos, safety checks, and knowledge questions here.' : 'This section is in place and ready for its training content.'}</p>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(window.location.hash)
  const [routePath, queryString = ''] = route.split('?')
  const routeParameters = new URLSearchParams(queryString)
  const contactService = routeParameters.get('service') || ''
  const contactMethod = routeParameters.get('method') || ''

  useEffect(() => {
    const updateRoute = () => {
      setRoute(window.location.hash)
      if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    const pageTitles = {
      '#/contact': 'Contact Us | E.T. Custom Landscaping',
      '#/apply': 'Employment Application | E.T. Custom Landscaping',
      '#/lawn-maintenance': 'Lawn Maintenance | E.T. Custom Landscaping',
      '#/landscaping': 'Landscaping | E.T. Custom Landscaping',
      '#/training': 'Crew Training | E.T. Custom Landscaping',
    }
    document.title = pageTitles[routePath] || 'E.T. Custom Landscaping'
  }, [routePath])

  if (routePath === '#/contact') return <ContactPage initialService={contactService} initialMethod={contactMethod} />
  if (routePath === '#/apply') return <ApplicationPage />
  if (routePath === '#/lawn-maintenance') return <LawnMaintenancePage />
  if (routePath === '#/landscaping') return <LandscapingPage />
  if (routePath === '#/training') return <TrainingPage />
  if (routePath.startsWith('#/training/')) return <TrainingTopicPage topicId={routePath.replace('#/training/', '')} />
  return <HomePage />
}

export default App
