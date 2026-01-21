import etLogo from '../assets/ET-custom-logo.png'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
    {/* Logo */}
      <div className="flex justify-center">
       <img
         src={etLogo}
         alt="E.T. Custom Landscaping logo"
        className="w-[400px] mb-6"
       />
      </div>


      {/* Intro paragraph */}
      <div className="flex justify-center">
        <div className="max-w-[720px] text-center leading-relaxed">
          <p className="text-[20px]">
            Welcome to <span className="font-bold">E.T. Custom Landscaping</span>, where nature’s
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
      <div className="flex justify-center my-8">
        <div className="w-[720px] h-px bg-gray-300" />
      </div>


      {/* Service area */}
      <div className="flex justify-center">
        <p className="max-w-[720px] text-[26px] text-center font-semibold">
          We proudly service Duval County, St. John’s County, and the Beaches.
        </p>
      </div>


      {/* Divider */}
      <div className="flex justify-center my-8">
        <div className="w-[720px] h-px bg-gray-300" />
      </div>

      {/* Contact button */}
      <div className="flex justify-center">
        <Link
          to="/contact"
          className="inline-flex bg-[#39ff14] text-black py-3.5 px-6 rounded-lg font-bold no-underline"
        >
          Contact Us
        </Link>
      </div>

      {/* Facebook section */}
      <div className="mt-14">
        <h2 className="text-center">Check out our projects on Facebook!</h2>

        <div className="flex justify-center mt-6">
          <a
            href="https://www.facebook.com/etcustomlandscaping"
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center"
            aria-label="Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
              className="w-6 h-6 fill-white"
            >
              <path d="M279.14 288l14.22-92.66h-88.91V117.78c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

export default Home
