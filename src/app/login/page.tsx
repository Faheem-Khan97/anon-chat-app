"use client";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { account, databases } from "../api";
import { useRouter } from "next/navigation";
import InputField from "@components/components/InputField";
import { useSessionContext } from "@components/context";
import { ISession, InviteFormInputs, LoginFormInputs } from "@components/types";
import MenuItem from "@components/components/MenuItem";
import { Loader } from "@components/components/Loader";
import Popup from "@components/components/Popup";
import { extractInviteLinkParts } from "@components/utils";

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormInputs>();

  const {
    register: inviteRegister,
    handleSubmit: submitInvite,
    formState: { errors: inviteFormErrors },
  } = useForm<InviteFormInputs>();

  const router = useRouter();
  const dbId = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";
  const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID ?? "";

  const { session, setSession } = useSessionContext();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPopupOpen, setisPopupOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => {
      clearTimeout(id);
    };
  }, []);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsPageLoading(true);
    const { name, room, description } = data;
    let tempSession = session;
    if (!tempSession) {
      const newSession = await account.createAnonymousSession();
    }
    tempSession = await account.updateName(name);
    localStorage.setItem("chat_session", JSON.stringify(tempSession));
    setSession(tempSession);

    const { $id } = tempSession ?? {};

    const document = await databases.createDocument(
      dbId,
      collectionId,
      "unique()",
      {
        name: room,
        description: description,
        created_by: $id,
        users: [$id],
      }
    );
    router.push(`/chat?room=${document.$id}`);
  };

  function joinClickHandler(event: any) {
    event.stopPropagation();
    event.preventDefault();

    console.log("join mee");
    setisPopupOpen(true);
  }

  function handleLogout() {
    setSession(null);
    localStorage.removeItem("chat_session");
    account.deleteSession("current");
    setValue("name", "");
  }

  const onInviteSubmit: SubmitHandler<InviteFormInputs> = (data) => {
    if (data.inviteLink) {
      const { roomId, encryptedString } = extractInviteLinkParts(
        data.inviteLink
      );

      router.push(`/chat?room=${roomId}+${encryptedString}`);
    }
  };

  function onClosePopup() {
    setisPopupOpen(false);
  }

  return (
    <div className="flex justify-center items-center h-screen bg-primary">
      {!isPageLoading ? (
        <>
          <div className="flex justify-center relative flex-col max-w-md mx-auto min-w-[350px] sm:min-w-[430px] min-h-[500px] items-center px-6 bg-secondary rounded-lg shadow-md">
            <h2 className=" text-2xl  font-bold mb-4">Enter Chat Room</h2>
            {/* {process.env.NEXT_PUBLIC_API_ENDPOINT} */}
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
              <InputField
                label="Name"
                id="name"
                placeholder="Enter Your Name "
                register={register("name", { required: true })}
                error={errors.name ? "Name is Required!" : ""}
                defaultValue={session?.name ?? ""}
              />
              <InputField
                label="Group Name"
                id="room"
                placeholder="Enter Group Name"
                register={register("room", { required: true, maxLength: 24 })}
                error={errors.room ? "Group Name is not valid!" : ""}
              />
              <div className="mb-4 relative">
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
              <div className="flex w-full gap-0.5 items-center  ">
                <p className=" text-sm text-secondaryTighter">
                  Already know a group?
                </p>
                <MenuItem
                  underline
                  onClick={joinClickHandler}
                  text="Click to join"
                />
              </div>
              <button
                disabled={Object.keys(errors).length > 0}
                className={`mt-3 w-full bg-primaryLight ${
                  Object.keys(errors).length > 0
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                } hover:bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60`}
              >
                Create New Group
              </button>
            </form>

            {session && (
              <div className="flex bottom-2 w-full gap-1 items-center ">
                <p className=" text-sm">
                  You&apos;re logged in as{" "}
                  <span className=" text-secondaryTighter ">
                    {session?.name}.
                  </span>
                </p>
                <MenuItem underline onClick={handleLogout} text="Logout" />
              </div>
            )}
          </div>
        </>
      ) : (
        <Loader />
      )}
      <Popup isOpen={isPopupOpen} onClose={onClosePopup} title="Join a Group">
        <form className="w-full gap-8 " onSubmit={submitInvite(onInviteSubmit)}>
          <InputField
            label="Paste Link"
            id="invite"
            placeholder="Paste Invite Link "
            register={inviteRegister("inviteLink", { required: true })}
            error={
              inviteFormErrors.inviteLink ? "Invite link can not be blank!" : ""
            }
          />
          <div className="flex w-full  gap-4 items-center h-[70px] ">
            <button
              className=" bg-secondaryTight hover:bg-secondaryTighter 
            text-secondary py-2 px-4 rounded focus:outline-none 
            focus:shadow-outline disabled:opacity-60`"
              onClick={onClosePopup}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Object.keys(inviteFormErrors).length > 0}
              className={` bg-primaryLight ${
                Object.keys(inviteFormErrors).length > 0
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              } hover:bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60`}
            >
              Join Group
            </button>
          </div>
        </form>
      </Popup>
    </div>
  );
};

export default LoginForm;
