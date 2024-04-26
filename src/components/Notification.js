// src/components/NotificationComponent.js
import React, { useState, useEffect } from "react";

const NotificationComponent = ({ showNotification }) => {
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showNotification) {
      setNotification({
        message: showNotification.message,
        type: showNotification.type,
      });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  }, [showNotification]);

  return (
    isVisible && (
      <div
        style={{
          color: notification.type === "error" ? "red" : "green",
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        {notification.message}
      </div>
    )
  );
};

export default NotificationComponent;
