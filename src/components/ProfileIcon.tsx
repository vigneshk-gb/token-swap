import React from "react";
const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const fillColor1 = getRandomColor();
  const fillColor2 = getRandomColor();
  
const ProfileIcon = () => {

  return (
    <svg width="30" height="30">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: fillColor1, stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: fillColor2, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <rect width="30" height="30" fill="url(#gradient1)" rx="40" ry="40" />
    </svg>
  );
};

export default ProfileIcon;
