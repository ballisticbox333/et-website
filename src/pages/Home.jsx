import etLogo from '../assets/ET-custom-logo.png'

function Home() {
  return (
    <>
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src={etLogo}
          alt="E.T. Custom Landscaping logo"
          style={{ width: 400, height: 'auto', marginBottom: 24 }}
        />
      </div>

      {/* Intro paragraph */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 720, textAlign: 'center', lineHeight: 1.6 }}>
          <p style={{ fontSize: '20px' }}>
            Welcome to <span style={{ fontWeight: 700 }}>E.T. Custom Landscaping</span>, where nature’s
            beauty meets skilled craftsmanship. We are your trusted partners in creating and
            maintaining captivating landscapes. With a passion for design, attention to detail, and
            a commitment to excellence, we are dedicated to creating stunning gardens and outdoor
            retreats that inspire, rejuvenate, and enhance the harmony between nature and
            architecture. Join us on a journey to transform your surroundings and unlock the full
            potential of your outdoor oasis!
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <div style={{ width: 720, height: 1, backgroundColor: '#ddd' }} />
      </div>

      {/* Service area */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontSize: '26px', textAlign: 'center', fontWeight: 600 }}>
          We proudly service Duval County, St. John’s County, and the Beaches.
        </p>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <div style={{ width: 720, height: 1, backgroundColor: '#ddd' }} />
      </div>

      {/* Contact button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a
          href="/contact"
          style={{
            backgroundColor: '#39ff14',
            color: '#000',
            padding: '14px 22px',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Contact Us
        </a>
      </div>

      {/* Facebook section */}
      <div style={{ marginTop: 56 }}>
        <h2 style={{ textAlign: 'center' }}>Check out our projects on Facebook!</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#39ff14',
              color: '#000',
              padding: '12px 18px',
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Open Facebook
          </a>
        </div>
      </div>
    </>
  )
}

export default Home
