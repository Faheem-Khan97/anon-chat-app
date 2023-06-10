import { MessageCardProps } from "@components/types";
import { getTimeFromTimestamp } from "@components/utils";
import React from "react";

const MessageCard: React.FC<MessageCardProps> = ({
  userName,
  message,
  createdAt,
}) => {
  return (
    <div className="flex flex-col w-fit max-w-[256px] gap-[2px] relative rounded-md px-3 pt-1.5 pb-4 bg-white">
      <p className="text-secondaryTighter text-xs">{userName}</p>
      <p className="text-secondaryTightest text-sm break-words">{message}</p>
      <p className="absolute text-secondaryTight text-xs right-1 bottom-0">
        {getTimeFromTimestamp(createdAt)}
      </p>
    </div>
  );
};

export default MessageCard;
