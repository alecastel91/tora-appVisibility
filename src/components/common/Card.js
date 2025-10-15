import React from 'react';

const Card = ({ children, className = '', onClick, padding = true }) => {
  return (
    <div 
      className={`card ${padding ? 'card-padded' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;