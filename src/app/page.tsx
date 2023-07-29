"use client";

import Footer from "@components/components/Footer";
import InputField from "@components/components/InputField";
import { InviteFormInputs } from "@components/types";
import { extractInviteLinkParts } from "@components/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { SubmitHandler, useForm } from "react-hook-form";

export default function Home() {
  const {
    register: inviteRegister,
    handleSubmit: submitInvite,
    formState: { errors: inviteFormErrors },
  } = useForm<InviteFormInputs>();
  const router = useRouter();

  const onInviteSubmit: SubmitHandler<InviteFormInputs> = (data) => {
    if (data.inviteLink) {
      const url = new URL(data.inviteLink);
      const roomParamValue = url.searchParams.get("room");
      const { roomId, encryptedString } = extractInviteLinkParts(
        roomParamValue ?? ""
      );

      router.push(`/chat?room=${roomId}+${encryptedString}`);
    }
  };
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex px-8 justify-between bg-primary items-center ">
        <Image
          src={"/logo-n-remove.png"}
          alt="Hood chat logo"
          width={110}
          height={110}
        />

        <button
          type="submit"
          className={` bg-secondaryTighter cursor-pointer
           hover:bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60`}
          onClick={() => {
            router.push("/login");
          }}
        >
          Get Started
        </button>
      </div>
      <div className="invite-form flex flex-col flex-1  bg-primary gap-4 pt-20 items-center  min-h-[500px] w-full ">
        <h1 className="text-white font-bold text-5xl ">
          Got the Invite Link? Paste Below!
        </h1>
        <div className=" w-[390px] pt-8  ">
          <form
            className="w-full gap-8 "
            onSubmit={submitInvite(onInviteSubmit)}
          >
            <InputField
              label=""
              id="invite"
              placeholder="Paste Invite Link "
              register={inviteRegister("inviteLink", { required: true })}
              error={
                inviteFormErrors.inviteLink
                  ? "Invite link can not be blank!"
                  : ""
              }
            />
            <div className="flex w-full  gap-4 items-center justify-between h-[70px] ">
              <button
                type="submit"
                disabled={Object.keys(inviteFormErrors).length > 0}
                className={` bg-secondaryTighter mx-auto ${
                  Object.keys(inviteFormErrors).length > 0
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                } hover:bg-primaryLight text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60`}
              >
                Join Group
              </button>
            </div>
          </form>
        </div>

        <div className="flex pt-12 gap-8 pb-8 justify-center border-t-2  flex-col bg-primary ">
          <h1 className="text-white font-bold text-4xl ">
            OR, Create a New Group
          </h1>
          <button
            className=" bg-primaryLight hover:bg-secondaryTighter 
            text-secondary py-2 px-4 rounded focus:outline-none 
            focus:shadow-outline disabled:opacity-60`"
            onClick={() => {
              router.push("/login");
            }}
          >
            New Group
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
