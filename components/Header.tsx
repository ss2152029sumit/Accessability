import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 pt-8 pb-8 border-b-4 border-primary px-4">
      <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
        🔍 Accessibility Narrator
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-2">
        Powered by Gemini 3 Pro
      </p>
      <p className="text-sm text-gray-500">
        For the 253 Million Visually Impaired
      </p>
    </header>
  );
};

export default Header;