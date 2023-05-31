"use client";

import { account, client, databases } from "../api";
import { IoMdSend } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Query } from "appwrite";
import { getTimeFromTimestamp } from "@components/utils";

type messageForm = {
  message: string;
};

const Chat: React.FC = () => {
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const room = params.get("room");
  const dbId = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";
  const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID ?? "";
  const roomId: String | undefined = Array.isArray(room) ? room[0] : room;

  const getAllMessagesForRoom = useCallback(
    async (roomId: String) => {
      const { documents } = await databases.listDocuments(dbId, collectionId, [
        Query.equal("room", [`${roomId}`]),
        Query.orderDesc("$createdAt"),
      ]);
      setRoomMessages(documents);
    },
    [dbId, collectionId]
  );

  useEffect(() => {
    if (roomId) {
      getAllMessagesForRoom(roomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = client.subscribe(
      [
        `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_ID}.documents`,
      ],
      (data) => {
        if (
          data.events.includes(
            `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_ID}.documents.*.create`
          )
        )
          setRoomMessages((messages) => [data.payload, ...messages]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

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
      const session = await account.get();
      const documentsInserted = await databases.createDocument(
        dbId,
        collectionId,
        "unique()",
        {
          message,
          name: session.name,
          room: roomId,
        }
      );
      roomId && getAllMessagesForRoom(roomId);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex justify-center flex-col gap-8 items-center h-screen bg-primary  py-1 ">
      <div className=" flex flex-col h-full min-w-[350px]  relative  bg-slate-200 rounded max-w-[600px] ">
        <div className=" flex items-center h-[8vh] justify-between px-2 bg-primaryLight  ">
          <h2 className=" text-xl text-secondaryTighter  ">
            {" "}
            Let&apos;s chat{" "}
          </h2>
          <button className=" text-sm text-[#a5b6f5]">Leave Room</button>
        </div>
        <div className="flex flex-col h-[83vh] gap-1 px-2 mt-1.5">
          <div
            className=" text-secondary flex flex-col-reverse gap-2  overflow-y-scroll scrollbar-hide   "
            id="scrollableDiv"
          >
            {roomMessages.map(({ name, message, $createdAt, $id }) => {
              return (
                <div
                  key={$id}
                  className="flex flex-col w-fit max-w-[256px]  gap-[2px] relative rounded-md px-2 pt-1.5 pb-4  bg-white "
                >
                  <p className=" text-secondaryTighter text-xs ">{name}</p>
                  <p className="text-secondaryTightest text-sm break-words">
                    {message}
                  </p>
                  <p className=" absolute text-secondaryTight text-xs right-1 bottom-0 ">
                    {getTimeFromTimestamp($createdAt)}
                  </p>
                </div>
              );
            })}
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
    </div>
  );
};

export default Chat;
