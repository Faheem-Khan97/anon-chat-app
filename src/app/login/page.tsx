"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { account } from "../api";
import { useRouter } from "next/navigation";
import InputField from "@components/components/InputField";

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
          <InputField
            label="Name"
            id="name"
            placeholder="Enter Name"
            register={register("name", { required: true })}
            error={errors.name ? "Name is Required!" : ""}
          />
          <InputField
            label="Group Name"
            id="room"
            placeholder="Enter Group Name"
            register={register("room", { required: true })}
            error={errors.room ? "Group Name is Required!" : ""}
          />

          <button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className={`mt-3 w-full bg-primaryLight ${
              Object.keys(errors).length > 0
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } hover:bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60`}
          >
            Start chatting
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
