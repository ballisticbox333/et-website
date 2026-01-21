import { useState } from 'react'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      alert('Please fill out name, email, and message before sending.')
      return
    }

    setSubmitted(true)

    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[720px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>

      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#39ff14] text-black py-3 px-6 rounded-lg font-bold"
            >
              Send Message
            </button>
          </div>

          <div className="mt-6 pt-4 border-t text-center text-gray-700">
            <p className="font-semibold">etcustomlandscaping@gmail.com</p>
            <p>(904) 775-0383</p>
          </div>
        </form>
      )}
      
      {submitted && (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Thank you!</h2>
          <p className="text-lg text-gray-700">
            We’ve received your message and will get back to you as soon as possible.
          </p>
        </div>
      )}
      </div>
    </div>
  )
}

export default Contact
