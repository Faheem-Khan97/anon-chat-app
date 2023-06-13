import React, { ReactNode } from "react";

interface PopupProps {
  onClose: () => void;
  children: ReactNode;
  isOpen: boolean;
  title: string;
}

const Popup: React.FC<PopupProps> = ({ onClose, children, isOpen, title }) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-opacity-75 bg-gray-800">
      <div className=" flex flex-col bg-white h-auto rounded-lg px-3 py-6 min-w-[340px]">
        <h2 className=" mx-auto mb-2 text-xl text-secondaryTighter ">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Popup;
