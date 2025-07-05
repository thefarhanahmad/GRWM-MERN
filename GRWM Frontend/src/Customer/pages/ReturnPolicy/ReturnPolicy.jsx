import React from "react";

const ReturnPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Return & Exchange Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">UK Returns</h2>
        <p className="text-gray-700 mb-4">
          You have <strong>30 days</strong> from the day you receive your order to return new, unworn, or unused products for a full refund of the cost of the goods. Please ensure items are returned in their original packaging and shoe box to avoid a £5 fee.
        </p>
        <p className="text-gray-700 mb-4">
          A £2.00 fee applies for processing UK returns. To initiate a return or exchange:
        </p>
        <ol className="list-decimal list-inside text-gray-700 mb-4">
          <li>
            Access the{" "}
            <a
              href="https://returnsportal.co/version-live/r/esska"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Returns Portal
            </a>.
          </li>
          <li>Enter your Order Number (found at the top right of your invoice).</li>
          <li>Select the item(s) you wish to return.</li>
          <li>Choose between a refund or exchange.</li>
          <li>Pick your preferred shipment option to generate an RMA number.</li>
          <li>Include the return slip inside your package and drop it off at your nearest Drop Off Point.</li>
        </ol>
        <p className="text-gray-700">
          Returns typically take 10 working days to process from receipt at our warehouse.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">International Returns</h2>
        <p className="text-gray-700 mb-4">
          International returns are at your own cost. Use our{" "}
          <a
            href="https://returnsportal.co/version-live/r/esska"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            International Returns Portal
          </a>{" "}
          to access specially negotiated courier rates.
        </p>
        <p className="text-gray-700 mb-4">
          Please note, we do not offer exchanges on international orders. If you would like a different size or design, please return the unwanted item(s) for a refund and place a new order online.
        </p>
        <p className="text-gray-700">
          All returns require an Esska RMA number. Do not return items without obtaining one through the portal.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Damaged or Faulty Items</h2>
        <p className="text-gray-700 mb-4">
          If you receive damaged or faulty shoes, contact us immediately at{" "}
          <a
            href="mailto:grwm.inquiries@gmail.com"
            className="text-blue-600 hover:underline"
          >
            grwm.inquiries@gmail.com
          </a>{" "}
          with your order number and photos of the damaged item.
        </p>
        <p className="text-gray-700">
          We will arrange a refund or exchange (exchange available for UK only). Shipping costs will be refunded for damaged or faulty items. You have 30 days from delivery to return the item through our Returns Portal.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Refund Processing</h2>
        <p className="text-gray-700 mb-4">
          Once your return is received and inspected, we will notify you via email. If approved, your refund will be processed within 3 days. The credit will be applied to your original payment method, but it may take up to 14 days for your bank to reflect the refund.
        </p>
        <p className="text-gray-700">
          If you haven't received your refund after this period, please check with your bank or contact us at{" "}
          <a
            href="mailto:grwm.inquiries@gmail.com"
            className="text-blue-600 hover:underline"
          >
            grwm.inquiries@gmail.com
          </a>.
        </p>
      </section>
    </div>
  );
};

export default ReturnPolicy;
