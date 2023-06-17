"use client";

import { account, client, databases } from "../api";
import { IoMdSend } from "react-icons/io";
import { BiLogOutCircle } from "react-icons/bi";
import { BsPeopleFill } from "react-icons/bs";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Query } from "appwrite";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AES, enc } from "crypto-js";

import { IMessage, nameFormInput, roomDetails } from "@components/types";
import MoreButton from "@components/components/MoreButton";
import MenuItem from "@components/components/MenuItem";
import MessageCard from "@components/components/MessageCard";
import { useSessionContext } from "@components/context";
import { Loader } from "@components/components/Loader";
import {
  extractInviteLinkParts,
  fetchRoomDetailsById,
  isStringPresentInArray,
} from "@components/utils";
import { SubmitHandler, useForm } from "react-hook-form";
import Popup from "@components/components/Popup";
import InputField from "@components/components/InputField";

const Chat: React.FC = () => {
  const [roomMessages, setRoomMessages] = useState<IMessage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const dbId = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";
  const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_MESSAGE ?? "";
  const collectionIdRoom = process.env.NEXT_PUBLIC_COLLECTION_ID ?? "";
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<nameFormInput>();

  const secret = process.env.NEXT_PUBLIC_SECRET ?? "";
  const { session, setSession } = useSessionContext();
  const [pageLoading, setPageLoading] = useState(true);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isNamePopUpOpen, setIsNamePopUpOpen] = useState(false);
  const params = useSearchParams();
  const roomParamValue = params.get("room");
  const [currentRoomDetails, setCurrentRoomDetails] =
    useState<roomDetails | null>(null);

  const currentURL = window.location.href; // Get the current URL
  const { roomId, encryptedString } = extractInviteLinkParts(
    roomParamValue ?? ""
  );

  const getAllMessagesForRoom = useCallback(
    async (roomId: String) => {
      const { documents } = await databases.listDocuments(dbId, collectionId, [
        Query.equal("group_id", [`${roomId}`]),
        Query.orderDesc("$createdAt"),
      ]);
      setRoomMessages(documents as unknown as IMessage[]);
      setPageLoading(false);
    },
    [dbId, collectionId]
  );

  const isUserAuthorized = useCallback(async () => {
    if (roomId) {
      try {
        const roomDetails = await fetchRoomDetailsById(roomId);
        setCurrentRoomDetails(roomDetails as unknown as roomDetails);
        const decryptedString = AES.decrypt(encryptedString, secret).toString(
          enc.Utf8
        );
        console.log({ decryptedString, session, roomDetails });
        const isUserAlreadyInGroup = isStringPresentInArray(
          roomDetails.users,
          session?.$id
        );
        if (isUserAlreadyInGroup || roomDetails.created_by == decryptedString) {
          setIsUserVerified(true);
          if (!isUserAlreadyInGroup) {
            try {
              const updateRoom = await databases.updateDocument(
                dbId,
                collectionIdRoom,
                roomId,
                {
                  users: [...roomDetails.users, session?.$id || session?.$id],
                }
              );
            } catch (error) {
              toast.error(`Failed to add you to this group`);
              setTimeout(() => {
                router.push("/login");
              }, 2000);
            }
          }
        } else {
          toast.error(
            `You are not authorized to enter this group. Get a correct invite link`
          );
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (error) {
        toast.error("Links seems broken, dude. ");
      }
    }
  }, [
    roomId,
    encryptedString,
    secret,
    session,
    dbId,
    collectionIdRoom,
    router,
  ]);

  useEffect(() => {
    if (!session || !session.name) {
      setIsNamePopUpOpen(true);
    } else {
      isUserAuthorized();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isUserVerified && session && roomId) {
      const unsubscribe = client.subscribe(
        [`databases.${dbId}.collections.${collectionId}.documents`],
        (data) => {
          if (
            data.events.includes(
              `databases.${dbId}.collections.${collectionId}.documents.*.create`
            )
          )
            console.log(data.payload);
          const newMessage = data.payload as IMessage;
          if (newMessage.group_id == roomId) {
            setRoomMessages((messages) => [newMessage, ...messages]);
          } else {
            showMessageNotification(newMessage);
          }
        }
      );

      const showMessageNotification = async (newMessage: IMessage) => {
        const roomdetails = await fetchRoomDetailsById(newMessage.group_id);
        if (isStringPresentInArray(roomdetails.users, newMessage.user_id))
          toast.info(newMessage.message);
      };

      if (roomId && session) {
        getAllMessagesForRoom(roomId);
      }

      return () => {
        unsubscribe();
      };
    }
  }, [
    isUserVerified,
    session,
    roomId,
    getAllMessagesForRoom,
    dbId,
    collectionId,
  ]);

  useEffect(() => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      const height = scrollableDiv?.scrollHeight;
      scrollableDiv.scrollTop = height;
    }
  }, [roomMessages]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = inputRef.current?.value;
    if (message && message.trim()) {
      // make api request
      const documentsInserted = await databases.createDocument(
        dbId,
        collectionId,
        "unique()",
        {
          message,
          user_name: session?.name,
          group_id: roomId,
          user_id: session?.$id,
          group_name: currentRoomDetails?.name ?? "",
        }
      );
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const leaveRoomClickHandler = async () => {
    await account.deleteSession("current");
    localStorage.removeItem("chat_session");
    setSession(null);
    console.log("push to login");
    router.push("/login");
  };

  async function getInviteLink() {
    const domainName = new URL(currentURL).origin; // Extract the domain name from the URL
    const modifiedURL = `${domainName}/chat?room=${roomId}`; // Append the query parameter to the domain name
    const userId = session?.$id;
    if (!userId) return;
    const encryptedUserId = AES.encrypt(userId, secret).toString();
    const url = `${modifiedURL}+${encryptedUserId}`;
    navigator.clipboard.writeText(url);
    toast.success(`${modifiedURL}+${encryptedUserId} copied`);
  }

  const onClosePopup = () => {
    setIsNamePopUpOpen(false);
  };

  const onNameSubmit: SubmitHandler<nameFormInput> = async ({ name }) => {
    if (!session) {
      const newSession = await account.createAnonymousSession();
    }
    const nameUpdate = await account.updateName(name);
    localStorage.setItem("chat_session", JSON.stringify(nameUpdate));
    setSession(nameUpdate);
    onClosePopup();
    isUserAuthorized();
  };

  return (
    <div className="flex justify-center flex-col items-center h-screen bg-primary  py-1 ">
      {!pageLoading ? (
        <div className=" flex flex-col min-w-[98%] h-[95%] sm:min-w-[80%] md:min-w-[50%] relative  bg-slate-200 rounded-md max-w-[550px] ">
          <div className=" flex items-center h-[8vh] justify-between rounded-t-md px-2 bg-primaryLight  ">
            <h2 className=" text-xl text-secondaryTighter  ">
              {" "}
              {currentRoomDetails?.name}
            </h2>
            <MoreButton>
              <MenuItem
                text="Logout"
                icon={<BiLogOutCircle />}
                onClick={leaveRoomClickHandler}
              />
              {currentRoomDetails?.created_by == session?.$id ? (
                <MenuItem
                  icon={<BsPeopleFill />}
                  text="Get Invite Link"
                  onClick={getInviteLink}
                />
              ) : null}
            </MoreButton>
          </div>
          <div className="flex flex-col h-[83vh] gap-1 px-2 mt-1.5">
            <div
              className=" text-secondary flex flex-col-reverse gap-2  overflow-y-scroll scrollbar-hide   "
              id="scrollableDiv"
            >
              {roomMessages.map(
                ({ user_name, message, $createdAt, user_id, $id }) => {
                  return (
                    <MessageCard
                      createdAt={$createdAt}
                      message={message}
                      userName={user_name}
                      key={$id}
                      userId={user_id}
                    />
                  );
                }
              )}
            </div>
            <form
              className=" w-[95%] flex gap-2 bottom-[6px] absolute  "
              onSubmit={onSubmit}
            >
              <div className="flex grow">
                <input
                  name="message"
                  type="text"
                  autoComplete="off"
                  id="room"
                  placeholder="Send Message"
                  className="flex grow text-sm p-2 border border-secondaryTight rounded focus:outline-none focus:border-secondaryTighter"
                  ref={inputRef}
                />
              </div>
              <button
                type="submit"
                className="bg-primaryLight  hover:bg-primaryLighter text-white py-1 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <IoMdSend size={24} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Loader />
      )}

      <Popup
        isOpen={isNamePopUpOpen}
        onClose={onClosePopup}
        title="Enter your Name to join chat"
      >
        <form className="w-full gap-8 " onSubmit={handleSubmit(onNameSubmit)}>
          <InputField
            label="Enter name"
            id="invite"
            placeholder="Enter your name "
            register={register("name", { required: true })}
            error={errors.name ? "Name can not be blank!" : ""}
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
              disabled={Object.keys(errors).length > 0}
              className={` bg-primaryLight ${
                Object.keys(errors).length > 0
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              } hover:bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60`}
            >
              Enter Chat
            </button>
          </div>
        </form>
      </Popup>

      <ToastContainer
        icon={true}
        position={"top-center"}
        pauseOnHover={false}
        toastClassName=" absolute text-xs"
      />
    </div>
  );
};

export default Chat;
