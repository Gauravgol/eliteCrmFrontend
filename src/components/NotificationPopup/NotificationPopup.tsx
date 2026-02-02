import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationPopup.css";

interface NotificationPopupProps {
    text: string;
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ text, onClose }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/chat");
        onClose();
    };

    return (
        <div className="notification-popup" onClick={handleClick}>
            <div className="notification-popup-content">
                <div className="notification-popup-header">
                    <strong>New Notification</strong>
                    <button className="close-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>×</button>
                </div>
                <div className="notification-popup-body">
                    {text}
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;
