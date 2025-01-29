import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Function to fetch notifications from the backend
const fetchNotifications = async (userId) => {
    const response = await fetch(
        `https://ai-backend-drcx.onrender.com/api/get-notifications?userId=${userId}`
    );
    const data = await response.json();
    return data.notifications || [];
};

const NotificationSD = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (userId) {
            fetchNotifications(userId).then(setNotifications).catch(setError);
        }
    }, [userId]);

    const handleToggle = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div>
            {/* Notification Button */}
            <button
                className="relative bg-blue-500 text-white px-3.5 py-2 rounded-sm"
                onClick={handleToggle}
            >
                <FontAwesomeIcon icon={faBell} />
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex justify-center items-center">
                    {notifications.length}
                </span>
            </button>

            {/* Notifications List */}
            {showNotifications && (
                <div className="absolute top-16 right-12 w-72 z-50 bg-white shadow-lg rounded-lg p-4 max-h-80 overflow-y-auto">
                    <h4 className="text-lg font-semibold">Notifications</h4>
                    {notifications.length === 0 ? (
                        <p>No new notifications.</p>
                    ) : (
                        <ul className="space-y-2">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.notif_id}
                                    className="p-2 border-b"
                                >
                                    <p className="text-sm">
                                        {notification.notification_message}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            notification.date_received
                                        ).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationSD;
