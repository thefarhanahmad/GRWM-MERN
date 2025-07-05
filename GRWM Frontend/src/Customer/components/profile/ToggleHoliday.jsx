import React, { useState } from "react";
import { Switch, Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import toast from "react-hot-toast";
import { Info, X } from "lucide-react";

const ToggleHoliday = ({ token, baseUrl, profile }) => {
  console.log("profile : ", profile);
  const [loading, setLoading] = useState(false);
  const [holidayStatus, setHolidayStatus] = useState(profile?.holidayMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // Store the new status before confirming
  const [showConditionInfo, setShowConditionInfo] = useState(false);

  const openModal = (newStatus) => {
    if (newStatus) {
      setPendingStatus(newStatus);
      setIsModalOpen(true);
    } else {
      handleConfirmToggle(newStatus);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingStatus(null);
  };

  const handleConfirmToggle = async (newStatus) => {
    setIsModalOpen(false);
    setLoading(true);

    try {
      await axios.put(
        `${baseUrl}/toggle-holiday`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHolidayStatus(newStatus);
      toast.success(`Holiday mode ${newStatus ? "enabled" : "disabled"}!`);
    } catch (error) {
      toast.error("Failed to update holiday status.");
    } finally {
      setLoading(false);
      setPendingStatus(null);
    }
  };

  return (
    <div className="text-black relative px-4 py-2  mt-4 sm:mt-0 rounded-lg">
      <div className="flex lg:pl-0 pl-6 items-center text-nowrap justify-end space-x-2 sm:space-x-3">
        <Info
          size={24}
          className=" text-gray-600"
          onClick={() => setShowConditionInfo(true)}
        />
        <span className="font-semibold">Holiday Mode</span>
        <Switch
          checked={holidayStatus}
          onChange={() => openModal(!holidayStatus)}
          className={`${
            holidayStatus ? "bg-gray-400" : "bg-gray-400"
          } relative inline-flex h-6 w-11 items-center rounded-full transition`}
          disabled={loading}
        >
          <span
            className={`${
              holidayStatus
                ? "translate-x-6 bg-black"
                : "translate-x-1 bg-white"
            } inline-block h-4 w-4 transform rounded-full transition`}
          />
        </Switch>
      </div>

      {/* Confirmation Modal */}
      <Transition show={isModalOpen} as={React.Fragment}>
        <Dialog
          onClose={closeModal}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>

          <div className="bg-white text-black rounded-lg p-4 sm:p-6 z-50 shadow-lg w-[90vw] max-w-sm mx-auto">
            <Dialog.Title className="text-lg font-semibold">
              Confirm Action
            </Dialog.Title>
            <p className="mt-2 text-sm">
              Are you sure you want to enable holiday mode?
            </p>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white text-black border border-black rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmToggle(pendingStatus)}
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal */}
      {showConditionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-xl p-3 md:p-6 relative">
            {/* Close Icon */}
            <button
              onClick={() => setShowConditionInfo(false)}
              className="absolute top-4 right-4 text-red-600 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold mb-3">Holiday Mode</h2>
            <div className=" text-sm text-black">
              This mode temporarily hides your profile and products on GRWM when
              you're out of town or unavailable, ensuring you don’t receive
              orders until you’re ready to sell again.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToggleHoliday;
