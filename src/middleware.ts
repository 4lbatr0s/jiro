//INFO: To prevent non-users to go to dashboard, only logged in users can see
//thats it, import authmiddleware, put the config object, that is all it takes.
import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'

export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
}

export default authMiddleware