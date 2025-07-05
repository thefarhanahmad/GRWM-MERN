import React, { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy from the date of delivery. The item must be unused, unwashed, and in its original packaging.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard delivery takes 3-7 business days depending on your location. Express delivery options are also available at checkout.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently, we only ship within India. Stay tuned as we expand to more regions soon!",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track it via the 'Track Order' option in our footer.",
    },
    {
      question: "What if I receive a damaged item?",
      answer:
        "If your item arrives damaged or defective, please contact our support within 48 hours with a photo, and we’ll arrange a replacement.",
    },
  ];

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 transition-all duration-300"
          >
            <button
              onClick={() => toggleIndex(index)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              {openIndex === index ? (
                <FiMinus className="text-xl" />
              ) : (
                <FiPlus className="text-xl" />
              )}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
