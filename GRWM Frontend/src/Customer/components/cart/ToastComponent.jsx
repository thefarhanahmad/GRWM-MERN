import { toast, Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const showToast = (type, message, product) => {
    const toastId = `toast-${product?.id || type}`;

    if (type === "success" && product) {
        toast.custom((t) => (
            <div className={`bg-black text-white p-4 rounded-lg shadow-lg w-[340px] relative ${t.visible ? 'animate-slide-in' : 'animate-slide-out'}`}>
                <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2">
                    <X className="w-5 h-5 text-white" />
                </button>
                <p className="text-md font-medium mb-4 mt-2">✔   Item added to your cart</p>
                <div className="flex items-start gap-3">
                    {product.image && (
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-20 h-20 rounded-md object-cover border border-gray-500"
                        />
                    )}
                    <div>
                        <p className="font-semibold text-lg">{product.title}</p>
                        <p className="font-semibold text-md">₹{product.price}</p>
                        <p className="font-semibold text-md">Size: {product.size} </p>
                    </div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                    <Link to="/cart" className="block text-center text-white border border-white py-3 rounded-md">View Cart</Link>
                    <Link to={`/buynow/${product.id}`} className="block text-center text-black bg-white py-3 rounded-md">
                        CheckOut
                    </Link>

                    <Link to="/" className="block text-center text-white underline">Continue Shopping</Link>
                </div>
            </div>
        ), { id: toastId, duration: 2000 });
    } else if (type === "error") {
        toast.error(message, {
            id: toastId,
            style: {
                borderRadius: "6px",
                background: "#fff",
                color: "#000",
                border: "1px solid black",
                minWidth: "300px",
                padding: "12px 16px",
            },
        });
    }
};

const ToastComponent = () => {
    return <Toaster position="top-right" reverseOrder={false} />;
};

export { showToast, ToastComponent };