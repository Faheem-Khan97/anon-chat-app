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
