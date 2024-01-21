import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  // Instantiate a new Pinecone client, which will automatically read the
  // env vars: PINECONE_API_KEY and PINECONE_ENVIRONMENT which come from
  // the Pinecone dashboard at https://app.pinecone.io
  const client = new Pinecone();
  return client;
};
