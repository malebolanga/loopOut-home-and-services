import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Placeholder for form submission logic
    console.log('Form submitted:', formData);

    // Reset form and show confirmation
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });

    // Add API call here if needed to send data to a backend
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Contact Details */}
        <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Our Contact Details</h2>
          <p className="text-lg mb-2">
            <strong>Business:</strong> LoupeOut Home
          </p>
          <p className="text-lg mb-2">
            <strong>Location:</strong> Polokwane
          </p>
          <p className="text-lg mb-2">
            <strong>Phone:</strong>{' '}
            <a href="tel:0838949697" className="text-blue-600">
              083 894 9697
            </a>
          </p>
          <p className="text-lg">
            <strong>Email:</strong>{' '}
            <a href="mailto:info@loupeout.com" className="text-blue-600">
              info@loupeout.com
            </a>
          </p>
        </div>

        {/* Contact Form */}
        <div className="flex-1 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
          {submitted ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-green-500 mb-4">
                Thank You!
              </h2>
              <p className="text-lg">We’ll get back to you soon.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block mb-1 font-medium">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg h-32 resize-none"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  Send Message
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
