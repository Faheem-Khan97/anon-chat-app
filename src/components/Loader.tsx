import { LoaderProps } from "@components/types";

export const Loader: React.FC<LoaderProps> = ({
  size = 32,
  color = "secondaryTighter",
  strokeWidth = 2,
}) => {
  const containerSize = size + strokeWidth * 2;

  return (
    <div
      className={`border-4 p-4 w-[${size}px] h-[${size}px] rounded-xl  border-${color}  animate-spin`}
    ></div>
  );
};
