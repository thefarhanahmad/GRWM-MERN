import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Address = ({ onSelectAddress }) => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
    pickupLocationName: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAddresses(data.data);
      } else {
        toast.error("Failed to fetch addresses.");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // toast.error("Could not load addresses.");
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSelect = (addressId) => {
    setSelectedAddress(addressId);
    onSelectAddress?.(addressId);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(addresses.filter((address) => address._id !== id));
      toast.success("Address deleted successfully.");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Could not delete address.");
    }
  };

  const handleEdit = (address) => {
    setEditingAddressId(address._id);
    setDeliveryAddress({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phoneNumber: address.phoneNumber,
      pickupLocationName: address.pickupLocationName || "",
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    if (Object.values(deliveryAddress).some((value) => value.trim() === "")) {
      toast.error("All fields are required.");
      return;
    }

    if (!/^[+]?\d{10,15}$/.test(deliveryAddress.phoneNumber.trim())) {
      toast.error("Invalid phone number.");
      return;
    }

    try {
      if (editingAddressId) {
        await axios.put(
          `${BASE_URL}/address/${editingAddressId}`,
          deliveryAddress,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Address updated successfully.");
        setEditingAddressId(null);
      } else {
        const { data } = await axios.post(
          `${BASE_URL}/address`,
          deliveryAddress,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAddresses([...addresses, data.data]);
        setSelectedAddress(data.data._id);
        onSelectAddress?.(data.data._id);
        toast.success("New address added successfully.");
      }
      setShowAddressForm(false);
      setDeliveryAddress({
        fullName: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: "",
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      // toast.error("Could not save address.");
    }
  };

  return (
    <div className="shadow-md bg-white max-w-6xl p-3 lg:p-6  lg:mx-16 mt-8   rounded-sm ">
      {!showAddressForm && (
        <h3 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
          Shipping Address
        </h3>
      )}
      {!showAddressForm && addresses.length > 0 && (
        <ul className="space-y-2">
          {addresses.map((address) => (
            <li
              key={address._id}
              className="flex items-center justify-between p-2 cursor-pointer border-b pb-2"
            >
              <div
                onClick={() => handleSelect(address._id)}
                className="flex space-x-4"
              >
                <input
                  type="radio"
                  name="address"
                  className="w-5 h-5"
                  checked={selectedAddress === address._id}
                  onChange={() => handleSelect(address._id)}
                />
                <div className="text-md">
                  <p className="font-medium">{address.fullName}</p>
                  <p>
                    {address.street}, {address.city}, {address.state} -{" "}
                    {address.postalCode} {address.country}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <FaEdit
                  size={20}
                  className="text-green-600 cursor-pointer"
                  onClick={() => handleEdit(address)}
                />
                <FaTrash
                  size={20}
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDelete(address._id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!showAddressForm && (
        <div className="text-center mt-10">
          <button
            className="border border-black text-black font-semibold w-full py-3 rounded-sm"
            onClick={() => setShowAddressForm(true)}
          >
            {editingAddressId ? "Edit Address" : "Add New Address"}
          </button>
        </div>
      )}

      {showAddressForm && (
        <div className="mt-2 bg-white p-4 rounded-lg">
          <div className="grid grid-cols-1 gap-5">
            {Object.keys(deliveryAddress).map((key) => (
              <div key={key}>
                <label className="block text-md font-medium text-gray-900 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <input
                  type="text"
                  className="p-3 w-full border border-gray-500 rounded-lg outline-none shadow-sm"
                  placeholder={key
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                  value={deliveryAddress[key]}
                  onChange={(e) =>
                    setDeliveryAddress({
                      ...deliveryAddress,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              className="border border-gray-400 text-gray-600 px-5 py-2 rounded-md"
              onClick={() => setShowAddressForm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-black text-white px-5 py-2 rounded-md"
              onClick={handleSaveAddress}
            >
              {editingAddressId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
