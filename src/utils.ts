import { InviteLinkParts } from "./types";

export function getTimeFromTimestamp(timestamp: Date): String {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function extractInviteLinkParts(inviteLink: string): InviteLinkParts {
  const url = new URL(inviteLink);
  const queryParams = new URLSearchParams(url.search);
  const roomParamValue = queryParams.get("room");
  const spaceIndex = roomParamValue?.indexOf(" ");
  const firstPart =
    spaceIndex !== -1
      ? roomParamValue?.substring(0, spaceIndex)
      : roomParamValue;
  const secondPart =
    spaceIndex && spaceIndex !== -1
      ? roomParamValue?.substring(spaceIndex + 1)?.replaceAll(" ", "+")
      : "";

  return {
    roomId: firstPart ?? "",
    encryptedString: secondPart ?? "",
  };
}
