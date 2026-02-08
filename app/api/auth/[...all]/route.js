import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force Node.js runtime (required for MongoDB)
export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth);
