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
import { extractInviteLinkParts } from "@components/utils";
import { SubmitHandler, useForm } from "react-hook-form";
import Popup from "@components/components/Popup";
import InputField from "@components/components/InputField";

const Chat: React.FC = () => {
  const [roomMessages, setRoomMessages] = useState<IMessage[]>([]);
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const room = params.get("room");
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
  const sessionString: string | null = localStorage.getItem("chat_session");
  const localSession = sessionString && JSON.parse(sessionString);
  const [pageLoading, setPageLoading] = useState(true);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isNamePopUpOpen, setIsNamePopUpOpen] = useState(false);
  const [currentRoomDetails, setCurrentRoomDetails] =
    useState<roomDetails | null>(null);

  const roomId: String | undefined = Array.isArray(room) ? room[0] : room;

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

  useEffect(() => {
    console.log("chat useeffect");
    const url = window.location.toString();
    const { roomId, encryptedString } = extractInviteLinkParts(
      window.location.href
    );
    console.log(roomId, encryptedString);
    async function getDetailsfromDb() {
      try {
        console.log("fetch rooommm");
        const roomDetails = await databases.getDocument(
          dbId,
          collectionIdRoom,
          roomId
        );
        // console.log({ roomDetails });
        setCurrentRoomDetails(roomDetails as unknown as roomDetails);

        const decryptedString = AES.decrypt(encryptedString, secret).toString(
          enc.Utf8
        );
        console.log({ decryptedString, session, roomDetails });
        if (roomDetails.users.includes(session?.$id)) {
          // this means user is already there in the session and have right access
          setIsUserVerified(true);

          console.log("mde entryyy");
        } else if (roomDetails.users.includes(decryptedString)) {
          // user have got the right invite link

          try {
            let newSession;
            if (!localSession) {
              console.log("new session");
              newSession = await account.createAnonymousSession();
            }
            // add this user id to list of users
            const updateRoom = databases.updateDocument(
              dbId,
              collectionIdRoom,
              roomId,
              {
                users: [...roomDetails.users, newSession?.$id || session?.$id],
              }
            );
            if (!localSession?.name) {
              // open the name pop up
              setIsNamePopUpOpen(true);
            } else {
              setIsUserVerified(true);
            }
          } catch (error) {
            toast.error("Failed to add you to this chat. Please try again.");
            router.push("/");
          }
        } else {
          toast.error("You are not authorized to enter this chat");
          router.push("/login");
        }
      } catch (error) {
        toast.error(`Group with ${roomId} not found.`);
        router.push("/login");
      }
    }
    if (roomId) {
      // fetch room details
      getDetailsfromDb();
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
          }
        }
      );

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
        }
      );
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const leaveRoomClickHandler = () => {
    account.deleteSession("current");
    localStorage.removeItem("chat_session");
    setSession(null);
    router.push("/login");
  };

  async function getInviteLink() {
    const currentURL = window.location.href; // Get the current URL
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
    const nameUpdate = await account.updateName(name);
    setSession(nameUpdate);
    localStorage.setItem("chat_session", JSON.stringify(nameUpdate));

    onClosePopup();
    setIsUserVerified(true);
  };

  return (
    <div className="flex justify-center flex-col items-center h-screen bg-primary  py-1 ">
      {!pageLoading ? (
        <div className=" flex flex-col h-full min-w-[98%] sm:min-w-[80%] md:min-w-[50%] relative  bg-slate-200 rounded-md max-w-[550px] ">
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
              <MenuItem
                icon={<BsPeopleFill />}
                text="Get Invite Link"
                onClick={getInviteLink}
              />
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
