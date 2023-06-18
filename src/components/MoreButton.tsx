import { MenuItemsList } from "@components/types";
import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

const MoreButton: React.FC<MenuItemsList> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleMenu}
        className="p-2 text-secondary hover:text-secondaryLighter focus:outline-none focus:text-secondaryLightest"
      >
        <FiMoreVertical />
      </button>
      {isOpen && (
        <div
          className=" flex z-10 flex-col absolute right-0 mt-2 p-4 gap-1 w-48 bg-white rounded-md shadow-lg"
          onClick={toggleMenu}
        >
          {/* Add your menu items here */}
          {children}
        </div>
      )}
    </div>
  );
};

export default MoreButton;
