"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { account, databases } from "../api";
import { useRouter } from "next/navigation";
import InputField from "@components/components/InputField";

type LoginFormInputs = {
  name: string;
  room: string;
  description?: String;
};

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const router = useRouter();
  const dbId = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";
  const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID ?? "";

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { name, room, description } = data;
    const { userId } = await account.createAnonymousSession();
    const nameUpdates = await account.updateName(name);
    const document = await databases.createDocument(
      dbId,
      collectionId,
      "unique()",
      {
        name: room,
        description: description,
        created_by: userId,
        users: [userId],
      }
    );
    router.push(`/chat?room=${document.$id}`);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-primary">
      <div className="flex justify-center flex-col max-w-md mx-auto min-w-[350px] sm:min-w-[430px] min-h-[450px] items-center px-6 bg-secondary rounded-lg shadow-md">
        <h2 className=" text-2xl  font-bold -mt-4 mb-4">Enter Chat Room</h2>
        {/* {process.env.NEXT_PUBLIC_API_ENDPOINT} */}
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="Name"
            id="name"
            placeholder="Enter Your Name "
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
          <div className="mb-5 relative">
            <label htmlFor="description">Description</label>
            <textarea
              {...register("description", { maxLength: 128 })}
              placeholder="Enter what describes your group"
              className="w-full py-2 px-2 border border-secondaryTight rounded focus:outline-none focus:border-secondaryTighter"
            />
            {errors.description && (
              <span className=" absolute -bottom-5 left-0 text-sm text-red-500">
                Description is too long.
              </span>
            )}
          </div>

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
