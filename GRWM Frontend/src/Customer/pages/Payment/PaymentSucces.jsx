import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your payment...");
  const [statusType, setStatusType] = useState("loading");
  const txnId = searchParams.get("txnId");
  const isBoost = searchParams.get("boost") === "true";
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!txnId) return;

    const verifyPayment = async () => {
      try {
        if (isBoost) {
          // 📌 Boost Payment Verification
          const boostTxnInfo = JSON.parse(localStorage.getItem("boostTxnInfo"));
          if (!boostTxnInfo || boostTxnInfo.txnId !== txnId) {
            setStatus("⚠️ Boost info missing or mismatched.");
            setStatusType("error");
            return;
          }

          const res = await axios.post(
            `${BASE_URL}/payment-boost`,
            {
              txnId,
              products: boostTxnInfo.products,
              duration: boostTxnInfo.duration,
              price: boostTxnInfo.price,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data?.success) {
            setStatus("✅ Boost Payment Successful! 🎉");
            setStatusType("success");
            localStorage.removeItem("boostTxnInfo");
          } else {
            setStatus("❌ Boost verification failed.");
            setStatusType("error");
          }
        } else {
          // 📌 Regular Order Verification
          const res = await axios.post(`${BASE_URL}/verify-payment`, {
            merchantTransactionId: txnId,
          });

          if (res.data?.success) {
            setStatus("✅ Payment Successful! 🎉");
            setStatusType("success");
          } else {
            setStatus("❌ Payment verification failed.");
            setStatusType("error");
          }
        }
      } catch (error) {
        setStatus("⚠️ Something went wrong.");
        setStatusType("error");
      }
    };

    verifyPayment();
  }, [txnId, isBoost]);

  return (
    <div className="md:h-screen py-20 md:py-0 bg-white flex items-center justify-center px-4">
      <div className="bg-[#111111] border border-gray-800 rounded-xl p-8 max-w-2xl w-full text-center shadow-lg">
        <h1
          className={`text-2xl font-semibold mb-4 ${
            statusType === "success"
              ? "text-green-400"
              : statusType === "error"
              ? "text-red-500"
              : "text-white"
          }`}
        >
          {status}
        </h1>

        {statusType === "success" && (
          <p className="text-gray-400 text-sm mb-6">
            Your transaction ID:{" "}
            <span className="text-white font-medium">{txnId}</span>
          </p>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
