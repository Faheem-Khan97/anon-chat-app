"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { account } from "../api";
import { useRouter } from "next/navigation";

type LoginFormInputs = {
  name: string;
  room: string;
};

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { name, room } = data;
    const session = await account.createAnonymousSession();
    const nameUpdates = await account.updateName(name);
    console.log({ session, nameUpdates });
    router.push(`/chat?room=${room}`);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-primary">
      <div className="flex justify-center flex-col max-w-md mx-auto min-w-[350px] sm:min-w-[430px] items-center min-h-[400px] px-6 bg-secondary rounded-lg shadow-md">
        <h2 className=" text-2xl  font-bold -mt-4 mb-4">Enter Chat Room</h2>
        {/* {process.env.NEXT_PUBLIC_API_ENDPOINT} */}
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 relative">
            <label className="block mb-1" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter Name"
              className="w-full py-2 px-2 border border-secondaryTight rounded focus:outline-none focus:border-secondaryTighter"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className=" -bottom-5 left-0 text-xs absolute text-red-500">
                Name is required
              </span>
            )}
          </div>
          <div className="mb-5 relative">
            <label className="block mb-1" htmlFor="room">
              Room
            </label>
            <input
              type="text"
              id="room"
              placeholder="Enter Room Name"
              className="w-full py-2 px-2 border border-secondaryTight rounded focus:outline-none focus:border-secondaryTighter"
              {...register("room", { required: true })}
            />
            {errors.room && (
              <span className=" absolute -bottom-5 left-0 text-sm text-red-500">
                Room is required
              </span>
            )}
          </div>
          <button
            type="submit"
            className="mt-3 w-full bg-primaryLight hover:bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Start chatting
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
