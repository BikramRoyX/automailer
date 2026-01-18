import 'dotenv/config';

console.log("Checking Environment Variables...");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set (length: " + process.env.GOOGLE_CLIENT_ID.length + ")" : "NOT SET");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Set (length: " + process.env.GOOGLE_CLIENT_SECRET.length + ")" : "NOT SET");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "NOT SET");
