import etLogo from '../assets/ET-custom-logo.png'
import { Link } from 'react-router-dom'
import cardPhoto1 from "../assets/cardPhoto1.png";
import cardPhoto2 from "../assets/cardPhoto2.png";
import cardPhoto3 from "../assets/cardPhoto3.png";
import cardPhoto4 from "../assets/cardPhoto4.png";



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
        <div className="max-w-4xl px-6 text-center leading-relaxed">
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

      {/* card1 */}
      <section className="mt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">
                Landscaping Design and Installation
              </h2>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. This section will explain what we do,
                what materials we use, and what the customer should expect from the
                process.
              </p>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. Mention plants, bed curbing, bed rock, and
                mulch, plus the outcome. clean finish, everything back in its place, and work 
                that they can appreciate
              </p>
            </div>

            <div className="aspect-[4/3] w-full overflow-hidden bg-black">
              <img
                src={cardPhoto1}
                alt="Landscaping work example"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* card2 */}
      <section className="mt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="md:order-2">
              <h2 className="text-3xl font-bold">
                Lawn Maintenance and Yard Care
              </h2>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. This section will explain what we do,
                what packages we provide, what machines and options we have, and what the customer should expect from the
                process.
              </p>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. Mention maintenance, trimming, weed control, and
                general cleaning up, plus the outcome. clean lines, a finished look, and work 
                that they can appreciate
              </p>
            </div>

            <div className="md:order-1 aspect-[4/3] w-full overflow-hidden bg-black">
              <img
                src={cardPhoto2}
                alt="Landscaping work example"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* card3 */}
      <section className="mt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">
                Clean Ups and Yard Repair
              </h2>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. This section will do the last thing and
                probably follow whatever the name of this section will be, idk what
                that will be yet so for now this is good
              </p>

              <p className="mt-4 leading-relaxed">
                This is also placeholder text which will be filled out later, for now I
                need to go and remove the about us section from the header, delete that
                as a seperate page and shove it in under the intro paragraph or under this
                section. If that's done when you see this page then you know why.
              </p>
            </div>

            <div className="aspect-[4/3] w-full overflow-hidden bg-black">
              <img
                src={cardPhoto3}
                alt="Landscaping work example"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* card4 */}
      <section className="mt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="md:order-2">
              <h2 className="text-3xl font-bold">
                Lawn Maintenance and Yard Care
              </h2>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. This section will explain what we do,
                what packages we provide, what machines and options we have, and what the customer should expect from the
                process.
              </p>

              <p className="mt-4 leading-relaxed">
                Placeholder text for now. Mention maintenance, trimming, weed control, and
                general cleaning up, plus the outcome. clean lines, a finished look, and work 
                that they can appreciate
              </p>
            </div>

            <div className="md:order-1 aspect-[4/3] w-full overflow-hidden bg-black">
              <img
                src={cardPhoto4}
                alt="Landscaping work example"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="mt-24 w-full bg-[#39ff14] text-black">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-3xl font-bold">About Us</h2>

          <p className="mt-4 leading-relaxed">
            Placeholder text again. But this one is pretty cool because the more I
            write here the more vertical space this green box I'm in will take up.
            So I'm going to put a bunch of stuff here now to make sure it works as intended.
            Grass refers to various families of plants. The three major families of grasslike
            plants are true grasses (Poaceae), sedges (Cyperaceae), and rushes (Juncaceae).
            Lawns and pasturelands are typically composed of true grasses, five of which cover
            46% of the world's arable land: rice, wheat, maize, barley, and sugar cane.
            "Grass" as a name has been applied to a wide group of unrelated plants including
            herbaceous plants whose leaves and stems are eaten by domesticated and wild animals.
            The word may have its origin in the Proto-Indo-European root *greh-, meaning 'to grow'.
            Grass can refer to a green area, such as a lawn, park, or a field, and is often used for
            recreation or for sports such as lawn tennis or bowls. Beginning in the 1970s, some sports
            venues have installed artificial grass to reduce maintenance costs.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="flex justify-center my-8">
        <div className="w-[720px] h-px bg-gray-300" />
      </div>

      {/* Service area */}
      <div className="flex justify-center">
        <p className="max-w-5xl text-[26px] text-center font-semibold">
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
