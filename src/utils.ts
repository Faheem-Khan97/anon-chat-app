import { databases } from "./app/api";
import { InviteLinkParts } from "./types";
const dbId = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";
const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_MESSAGE ?? "";
const collectionIdRoom = process.env.NEXT_PUBLIC_COLLECTION_ID ?? "";

export function getTimeFromTimestamp(timestamp: Date): String {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function extractInviteLinkParts(inviteLink: string): InviteLinkParts {
  const spaceIndex = inviteLink?.indexOf(" ");
  console.log({ inviteLink, spaceIndex });
  const firstPart =
    spaceIndex !== -1 ? inviteLink?.substring(0, spaceIndex) : inviteLink;
  const secondPart =
    spaceIndex && spaceIndex !== -1
      ? inviteLink?.substring(spaceIndex + 1)?.replaceAll(" ", "+")
      : "";
  console.log({ firstPart, secondPart });
  return {
    roomId: firstPart ?? "",
    encryptedString: secondPart ?? "",
  };
}

export const fetchRoomDetailsById = async (id: string) => {
  try {
    const roomDetails = await databases.getDocument(dbId, collectionIdRoom, id);
    return roomDetails;
  } catch (error) {
    throw new Error("Failed to fetch group details");
  }
};

export const isStringPresentInArray = (
  arr: string[],
  str?: string
): boolean => {
  if (!str) return false;
  return arr.includes(str);
};
