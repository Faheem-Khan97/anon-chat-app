import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex bg-primaryLight text-sm text-white  min-h-[12vh] items-center gap-4 justify-center flex-col ">
      <p> All Rights Reserved &copy; {currentYear} Hood Chat</p>
      <p> Designed & Developed with ❤ - Faheem Khan </p>
    </footer>
  );
};

export default Footer;
