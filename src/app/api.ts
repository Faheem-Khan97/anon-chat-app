"use client";

import { Client, Account, Databases } from "appwrite";

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_API_ENDPOINT) // Your API Endpoint
  .setProject(process.env.NEXT_PUBLIC_PROJECT_NAME); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
