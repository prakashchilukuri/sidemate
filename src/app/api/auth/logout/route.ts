import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiSuccess } from "@/lib/tenant";

export async function POST() {
  const response = apiSuccess({ message: "Logged out successfully" });
  response.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`
  );
  return response;
}
