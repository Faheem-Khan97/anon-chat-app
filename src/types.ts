import { ReactNode, SyntheticEvent } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export interface InsertIntoDB {
  db: string;
  collection: string;
  document: Document;
}

export interface IMessage {
  message: string;
  user_id: string;
  user_name: string;
  group_id: string;
  $id: string;
  $createdAt: Date;
  $updatedAt: Date;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
  group_name: string;
}

export interface InputFieldProps {
  id: string;
  label: string;
  placeholder: string;
  register?: UseFormRegisterReturn<string>;
  error?: string;
  defaultValue?: string;
  underline?: boolean;
}

export interface MenuItemProps {
  text: string;
  icon?: ReactNode;
  underline?: boolean;
  onClick: (event?: SyntheticEvent) => void;
}

export interface MenuItemsList {
  children: ReactNode | ReactNode[];
}
export interface MessageCardProps {
  userName: string;
  message: string;
  createdAt: Date;
  userId: string;
}

export interface ISession {
  $createdAt: string;
  $id: string;
  $updatedAt: string;
  email: string;
  emailVerification: boolean;
  name: string;
  passwordUpdate: string;
  phone: string;
  phoneVerification: boolean;
  prefs: Record<string, any>;
  registration: string;
  status: boolean;
}

export interface IContext {
  session: ISession | null;
  setSession: (session: ISession | null) => void;
}

export interface LoaderProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export interface InviteLinkParts {
  roomId: string;
  encryptedString: string;
}

export type LoginFormInputs = {
  name: string;
  room: string;
  description?: String;
};

export type InviteFormInputs = {
  inviteLink?: string;
};

export type nameFormInput = {
  name: string;
};

export interface roomDetails {
  name: string;
  $id: string;
  created_by: string;
  description?: string;
  users: any[];
}
