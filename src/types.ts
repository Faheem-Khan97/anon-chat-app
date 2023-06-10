import { ReactNode } from "react";
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
}

export interface InputFieldProps {
  id: string;
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn<string>;
  error?: String;
}

export interface MenuItemProps {
  text: string;
  icon: ReactNode;
  onClick: () => void;
}

export interface MenuItemsList {
  children: ReactNode | ReactNode[];
}
export interface MessageCardProps {
  userName: string;
  message: string;
  createdAt: Date;
}
