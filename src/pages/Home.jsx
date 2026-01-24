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
        <h2 className="text-center">Check out our projects on social media!</h2>

        <div className="flex justify-center gap-6 mt-6">
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
          <a
            href="https://www.instagram.com/etcustomlandscaping/"
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center"
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-7 h-7 fill-white"
            >
              <path d="M7.75 2h8.5C19.99 2 22 4.01 22 6.25v8.5C22 17.99 19.99 20 16.25 20h-8.5C4.01 20 2 17.99 2 15.75v-8.5C2 4.01 4.01 2 7.75 2zm0 1.5C4.84 3.5 3.5 4.84 3.5 7.75v8.5c0 2.91 1.34 4.25 4.25 4.25h8.5c2.91 0 4.25-1.34 4.25-4.25v-8.5c0-2.91-1.34-4.25-4.25-4.25h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-.88a1.13 1.13 0 110 2.26 1.13 1.13 0 010-2.26z"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

export default Home
