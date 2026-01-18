# Fixing Vercel Login Loop & Callback Error

You have encountered a `?error=Callback` on your Vercel deployment. This usually indicates a configuration mismatch between your Google Cloud Console and your deployed application, or a database access issue.

**CRITICAL FINDING FROM LOGS:**
Your Vercel logs show:
```
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
  -->  schema.prisma:7
   | 
 6 |   provider = "sqlite"
```
This proves that **Vercel is running an OLD version of your code** where Prisma was set to `sqlite`.
Your local code works because it is set to `postgresql`.

## 1. Immediate Action: Push Local Changes
You MUST push your local changes to GitHub to update Vercel.

1.  Open your terminal.
2.  Run:
    ```bash
    git add .
    git commit -m "fix: switch prisma to postgresql and add error handling"
    git push origin main
    ```
    *(Replace `main` with your branch name if different).*

3.  Wait for the Vercel deployment to finish.

## 2. Verify Vercel Build
in Vercel Dashboard > Deployments > [Latest Deployment] > Building:
Ensure you see `prisma generate` running and outputting that it generated the client for **PostgreSQL**.

## 3. Check Google Cloud Console Configuration
(Once the code is updated, if you still get an error, check this)

1.  Go to [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Look at **Authorized redirect URIs**.
3.  Ensure you have the EXACT production URL:
    *   `https://automailer-beta.vercel.app/api/auth/callback/google`

## 4. Check Vercel Environment Variables
Ensure your Vercel Project Settings > Environment Variables are correct:

*   `NEXTAUTH_URL`: `https://automailer-beta.vercel.app`
*   `DATABASE_URL`: Must be a valid connection string to your production database.

## 5. Dangerous Email Linking
We have `allowDangerousEmailAccountLinking: true` enabled. This allows signing in with Google even if you created an account with the same email/password.
