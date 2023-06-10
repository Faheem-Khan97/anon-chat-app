import { InputFieldProps } from "@components/types";
import React from "react";

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  placeholder,
  register,
  error,
}) => {
  return (
    <div className="mb-5 relative">
      <label className="block mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        className="w-full py-2 px-2 border border-secondaryTight rounded focus:outline-none focus:border-secondaryTighter"
        {...register}
      />

      {error && (
        <span className="-bottom-5 left-0 text-xs absolute text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;
