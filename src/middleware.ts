//INFO: To prevent non-users to go to dashboard, only logged in users can see
//thats it, import authmiddleware, put the config object, that is all it takes.
import {withAuth} from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";
export default function middleware(req:NextRequest) {
    return withAuth(req);
}
export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
};

