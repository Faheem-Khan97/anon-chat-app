import { MenuItemProps } from "@components/types";
import React from "react";

const MenuItem: React.FC<MenuItemProps> = ({ text, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className=" py-1 items-center flex gap-1 text-sm text-primaryLight "
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default MenuItem;
