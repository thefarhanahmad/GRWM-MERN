import { Toaster, toast } from "react-hot-toast";
import { CheckCircle, AlertCircle } from "lucide-react"; // ✅ Custom Icons

const showToast = (type, message) => {
  if (type === "success") {
    toast.success(message, {
      icon: <CheckCircle className="text-black w-6 h-6" />, // ✅ Black Success Icon
      style: {
        borderRadius: "6px", // ✅ More rounded
        background: "#fff",
        color: "#000",
        border: "1px solid black",
        minWidth: "300px", // ✅ Increased width
        padding: "12px 16px", // ✅ Better spacing
      },
    });
  } else if (type === "error") {
    toast.error(message, {
      icon: <AlertCircle className="text-red-500 w-6 h-6" />, // ✅ Red Error Icon
      style: {
        borderRadius: "6px", // ✅ More rounded
        background: "#fff",
        color: "#000",
        border: "1px solid black",
        minWidth: "300px", // ✅ Increased width
        padding: "12px 16px", // ✅ Better spacing
      },
    });
  }
};

const ToastComponent = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className:
          "rounded-md bg-white text-black border border-black min-w-[300px] px-4 py-3 z-[1000]", // ✅ Tailwind applied
      }}
      containerClassName="z-[1000]"
    />
  );
};

export { showToast, ToastComponent };
