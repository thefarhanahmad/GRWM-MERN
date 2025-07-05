import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Function to show the toast notification
const showToast = (type, message, product) => {
    const toastId = `toast-${product?.id || type}`;

    if (type === "success" && product) {
        toast.custom((t) => (
            <div
                className={`bg-black text-white p-4 rounded-lg shadow-lg relative w-[340px] ${t.visible ? 'animate-slide-in' : 'animate-slide-out'}`}
                
            >
                <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2">
                    <X className="w-5 h-5 text-white" />
                </button>
                <p className="text-xl font-medium mb-4 mt-2">✔ {message}</p>
                <div className="flex items-start gap-3">
                    {product.images?.[0] && (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-20 h-20 rounded-md object-cover border border-gray-500"
                        />
                    )}
                    <div>
                        <p className="font-semibold text-lg">{product.title}</p>
                        <p className="font-semibold text-md">₹{product.price}</p>
                        <p className="font-semibold text-md">Size: {product.size}</p>
                    </div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                    <Link to="/addproducts" className="block text-center bg-white text-black py-2 rounded-md">
                        Continue Uploading
                    </Link>
                    <Link to="/seller/hub" className="block text-center bg-black text-white py-2 rounded-md">
                        View All Products
                    </Link>

                    
                </div>
            </div>
        ), { id: toastId, duration: 5000 });
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
                position: 'absolute', // Center it similarly for error
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,      // Ensure it's on top of other elements
            },
        });
    }
};


const ToastComponent = () => {
    return (
        <div>
            {/* Toaster container to handle all toasts */}
            <Toaster
                position="top-right"  // Changed to top-right for typical toast positioning
                reverseOrder={false}
                containerStyle={{
                    position: 'fixed',
                    top: '20px',  // Some spacing from the top
                    right: '20px', // Align to the right of the screen
                    zIndex: 9999, // Ensure it's on top of other elements
                }}
            />
        </div>
    );
};

export { showToast, ToastComponent };
