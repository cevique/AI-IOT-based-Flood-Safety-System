import React from 'react';
import { FaTelegram, FaInstagram, FaFacebook, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

export default function Contact() {
  const contacts = [
    {
      name: "Email",
      icon: <FaEnvelope className="text-4xl text-red-500" />,
      link: "mailto:support@floodsystem.com",
      desc: "Official Support",
      color: "border-red-500 hover:bg-red-50"
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="text-4xl text-blue-500" />,
      link: "https://t.me/flood_alert_bot",
      desc: "Instant Alerts Bot",
      color: "border-blue-500 hover:bg-blue-50"
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="text-4xl text-pink-600" />,
      link: "https://instagram.com/flood_safety",
      desc: "Follow for Updates",
      color: "border-pink-500 hover:bg-pink-50"
    },
    {
      name: "Facebook",
      icon: <FaFacebook className="text-4xl text-blue-700" />,
      link: "https://facebook.com/flood.safety.system",
      desc: "Community Page",
      color: "border-blue-700 hover:bg-blue-50"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contact Us</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <a
            key={contact.name}
            href={contact.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-6 bg-white rounded-xl shadow-md border-l-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${contact.color}`}
          >
            <div className="p-3 bg-gray-100 rounded-full">
              {contact.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{contact.name}</h3>
              <p className="text-gray-500">{contact.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-12 bg-blue-600 text-white p-8 rounded-2xl shadow-lg text-center">
        <h3 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h3>
        <p className="mb-6 opacity-90">
          Our support team is available 24/7 to assist with any sensor issues or alert configurations.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
          Start Live Chat
        </button>
      </div>
    </div>
  );
}
