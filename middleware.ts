import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            console.log("Middleware Debug: Path:", req.nextUrl.pathname);
            console.log("Middleware Debug: Token exists?", !!token);
            if (!token) { // Only log cookies if token is missing to reduce noise
                console.log("Middleware Debug: Available Cookies:", req.cookies.getAll().map(c => c.name));
            }
            // Strict Check: Only allow if token exists
            const isAuth = !!token;
            if (!isAuth) {
                console.log("Middleware: Blocked access to", req.nextUrl.pathname);
            }
            return isAuth;
        },
    },
    pages: {
        signIn: "/login",
    },
})

export const config = {
    matcher: ["/dashboard/:path*"]
}
