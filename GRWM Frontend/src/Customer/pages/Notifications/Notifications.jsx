import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { BsBell } from "react-icons/bs";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
} from "../../../redux/slices/notificationSlice";

const Notifications = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const { notifications, loading, error } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    if (!user || !token) return;

    // Fetch + mark as read when visiting page
    dispatch(fetchNotifications(token));
    dispatch(markAllNotificationsAsRead(token));
  }, [user]);

  // Inline styles for scrollable container with hidden scrollbar
  const scrollableStyle = {
    height: "600px",
    overflowY: "auto",
    paddingRight: "8px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  const hideScrollbar = {
    "::-webkit-scrollbar": {
      display: "none",
    },
  };

  return (
    <div className=" lg:px-12 mt-8 mb-8 font-openSans">
      <div className="mx-auto bg-white p-3 lg:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h3 className="text-xl md:text-3xl text-start font-semibold font-horizon text-black">
            Notifications
          </h3>
          <BsBell className="text-2xl text-black" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-black"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            No notifications found.
          </div>
        ) : (
          // Scrollable Container with hidden scrollbar using inline styles
          <ul style={{ ...scrollableStyle, ...hideScrollbar }}>
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className="p-4 mb-4 border rounded-md bg-white shadow-sm"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {notification.title}
                  </h3>
                  <p className="text-gray-700">{notification.message}</p>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
