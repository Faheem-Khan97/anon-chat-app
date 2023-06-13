import { MenuItemProps } from "@components/types";
import React from "react";

const MenuItem: React.FC<MenuItemProps> = ({
  text,
  onClick,
  icon,
  underline,
}) => {
  return (
    <button
      onClick={onClick}
      className={` py-1 ${
        underline ? "underline" : ""
      } items-center flex gap-1 text-sm text-primaryLight  `}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default MenuItem;
