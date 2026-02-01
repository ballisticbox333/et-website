import { useState } from "react";
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyfh1am-7Y0Dd1fZ3yvTA8qtMJc1Zmevx05f4Ulsa8Oz0U0OjPb0m_bU2SBHGLObHzZYg/exec";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState("Lawn Maintenance");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return;
    }

    // Fire-and-forget to avoid CORS issues with Apps Script
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          serviceType,
          message: trimmedMessage,
          page: window.location.href,
        }),
      });

      setSubmitted(true);
      setName("");
      setEmail("");
      setServiceType("Lawn Maintenance");
      setMessage("");
    } catch {
      // If the network totally fails, don't pretend it worked
      // (We’ll add a visible error message in the next step if this happens.)
      return;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6">
      <h1 className="text-3xl font-bold mb-10 text-center">Contact Us</h1>

      <div className="grid gap-10 md:grid-cols-2">
        {/* LEFT COLUMN */}
        <div>
          <p className="text-gray-700 leading-relaxed mb-8">
            Looking for a free estimate on your next project, or simply need a
            reliable quality lawn service? Feel free to reach out, we’d love to
            hear from you!
          </p>

          {!submitted && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-gray-700" htmlFor="name">
                    Name (required)
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700" htmlFor="email">
                    Email (required)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700" htmlFor="serviceType">
                  Service Type
                </label>
                <select
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3"
                >
                  <option value="Lawn Maintenance">Lawn Maintenance</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Clean-Up">Clean-Up</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="8"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3"
                />
              </div>

              <button
                type="submit"
                className="bg-[#39ff14] text-black py-3 px-6 font-bold"
              >
                Send
              </button>
            </form>
          )}

          {submitted && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-3">Thank you!</h2>
              <p className="text-gray-700">
                We’ve received your message and will get back to you as soon as
                possible.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-10">
          <div>
            <p className="font-semibold">etcustomlandscaping@gmail.com</p>
            <p className="font-semibold">(904) 775-0383</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Hours</h2>

            <div className="grid grid-cols-2 gap-y-3">
              <p className="font-semibold">Monday</p>
              <p>7:00 am – 7:00 pm</p>

              <p className="font-semibold">Tuesday</p>
              <p>7:00 am – 7:00 pm</p>

              <p className="font-semibold">Wednesday</p>
              <p>7:00 am – 7:00 pm</p>

              <p className="font-semibold">Thursday</p>
              <p>7:00 am – 7:00 pm</p>

              <p className="font-semibold">Friday</p>
              <p>7:00 am – 7:00 pm</p>

              <p className="font-semibold">Saturday</p>
              <p>7:00 am – 5:00 pm</p>

              <p className="font-semibold">Sunday</p>
              <p>7:00 am – 5:00 pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
