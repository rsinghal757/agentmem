import { auth } from "@clerk/nextjs/server";

export async function requireUserId() {
  const session = await auth();
  return session.userId ?? null;
}
