import { AppwriteException } from "node-appwrite";

import { databases } from "./appwrite";
import {
  COLLECTION_SCHEMAS,
  DATABASE_ID,
  DATABASE_NAME,
  AttributeDefinition,
  IndexDefinition,
  CollectionSchema
} from "./database-schema";

const isNotFound = (error: unknown): error is AppwriteException =>
  error instanceof AppwriteException && error.code === 404;

export async function ensureAppwriteDatabase() {
  await ensureDatabaseExists();

  for (const collection of COLLECTION_SCHEMAS) {
    await ensureCollection(collection);
  }
}

async function ensureDatabaseExists() {
  try {
    await databases.get(DATABASE_ID);
  } catch (error) {
    if (isNotFound(error)) {
      await databases.create(DATABASE_ID, DATABASE_NAME);
      return;
    }

    throw error;
  }
}

async function ensureCollection(schema: CollectionSchema) {
  const { id: collectionId, name: collectionName } = schema;
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
  } catch (error) {
    if (isNotFound(error)) {
      await databases.createCollection(
        DATABASE_ID,
        collectionId,
        collectionName,
        schema.permissions ?? [],
        schema.documentSecurity ?? true
      );
    } else {
      throw error;
    }
  }

  for (const attribute of schema.attributes) {
    await ensureAttribute(collectionId, attribute);
  }

  if (schema.indexes) {
    for (const index of schema.indexes) {
      await ensureIndex(collectionId, index);
    }
  }
}

async function ensureAttribute(collectionId: string, attribute: AttributeDefinition) {
  try {
    await databases.getAttribute(DATABASE_ID, collectionId, attribute.key);
    return;
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }

  switch (attribute.type) {
    case "string":
      await databases.createStringAttribute(
        DATABASE_ID,
        collectionId,
        attribute.key,
        attribute.size,
        attribute.required ?? false,
        attribute.required ? undefined : (attribute.default ?? undefined),
        attribute.array ?? false
      );
      break;
    case "enum":
      await databases.createEnumAttribute(
        DATABASE_ID,
        collectionId,
        attribute.key,
        attribute.elements,
        attribute.required ?? false,
        attribute.required ? undefined : (attribute.default ?? undefined),
        attribute.array ?? false
      );
      break;
    case "integer":
      await databases.createIntegerAttribute(
        DATABASE_ID,
        collectionId,
        attribute.key,
        attribute.required ?? false,
        attribute.min ?? undefined,
        attribute.max ?? undefined,
        attribute.required ? undefined : (attribute.default ?? undefined),
        attribute.array ?? false
      );
      break;
    case "float":
      await databases.createFloatAttribute(
        DATABASE_ID,
        collectionId,
        attribute.key,
        attribute.required ?? false,
        attribute.min ?? undefined,
        attribute.max ?? undefined,
        attribute.required ? undefined : (attribute.default ?? undefined),
        attribute.array ?? false
      );
      break;
    case "boolean":
      await databases.createBooleanAttribute(
        DATABASE_ID,
        collectionId,
        attribute.key,
        attribute.required ?? false,
        attribute.required ? undefined : (attribute.default ?? undefined)
      );
      break;
    case "datetime":
      await databases.createDatetimeAttribute(
        DATABASE_ID,
        collectionId,
        attribute.key,
        attribute.required ?? false,
        attribute.required ? undefined : (attribute.default ?? undefined),
        attribute.array ?? false
      );
      break;
    default:
      // Exhaustive check for new attribute types
      const _exhaustiveCheck: never = attribute;
      void _exhaustiveCheck;
      throw new Error("Unsupported attribute type");
  }
}

async function ensureIndex(collectionId: string, index: IndexDefinition) {
  try {
    await databases.getIndex(DATABASE_ID, collectionId, index.key);
    return;
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }

  await databases.createIndex(
    DATABASE_ID,
    collectionId,
    index.key,
    index.type,
    index.attributes,
    index.orders ?? undefined
  );
}
