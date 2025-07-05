import React, { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const HelpCenter = () => {
  const [faqs, setFaqs] = useState([
    {
      question: "How can I reset my password?",
      answer:
        'To reset your password, navigate to "Settings" and select "Change Password." Follow the on-screen instructions to securely update your credentials.',
      open: false,
    },
    {
      question: "How do I update my profile information?",
      answer:
        'Go to the "Personal Information" section. Here, you can modify your name, email, phone number, and Profile Image.',
      open: false,
    },
    // { question: 'How can I contact support?', answer: 'If you require further assistance, feel free to email us at support@example.com. Our team will get back to you as soon as possible.', open: false },
    {
      question: "How do I track my order?",
      answer:
        'Go to the "My Orders" section in your account. Select the order you want to track and view the latest status.',
      open: false,
    },
    // { question: 'What is the refund policy?', answer: 'Our refund policy allows you to request a refund within 2 days of delivery. Please visit the "Refund & Returns" section for more details.', open: false },
  ]);

  const toggleFAQ = (index) => {
    setFaqs(
      faqs.map((faq, i) => {
        faq.open = i === index ? !faq.open : false;
        return faq;
      })
    );
  };

  return (
    <div className="max-w-5xl bg-white mt-10 mx-auto px-6  pb-20 py-12">
      <h1 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        Help & Support
      </h1>

      {/* FAQ Section */}
      <div>
        <h3 className="text-xl font-semibold mb-3">
          Frequently Asked Questions
        </h3>
        <p className="text-gray-600 mb-6">
          Find answers to common queries about your account, security, and more.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                {faq.open ? (
                  <FiMinus className="text-xl" />
                ) : (
                  <FiPlus className="text-xl" />
                )}
              </button>
              {faq.open && <p className="mt-3 text-gray-700">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-3">Contact Support</h3>
        <p className="text-gray-700 mb-2">
          If you need personalized assistance, our support team is here to help.
          Feel free to reach out to us via email, and we'll respond as soon as
          possible.
        </p>
        <p className="text-lg font-medium">
          Email:{" "}
          <a
            href="mailto:grwm.inquiries@gmail.com"
            className="text-blue-600 hover:underline"
          >
            grwm.inquiries@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default HelpCenter;
