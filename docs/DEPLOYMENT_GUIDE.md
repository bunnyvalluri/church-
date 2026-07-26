# Deployment Guide for Kingdom of Christ Ministries

This guide will help you deploy your church website to **Vercel**, the best platform for Next.js applications.

## Prerequisites
- A [GitHub](https://github.com/) account.
- A [Vercel](https://vercel.com/) account (you can sign up with GitHub).

## Step 1: Initialize Git and Push to GitHub

1.  Open your terminal in VS Code (`Ctrl + ~`).
2.  Initialize a new Git repository:
    ```bash
    git init
    ```
3.  Add all your files:
    ```bash
    git add .
    ```
4.  Commit your changes:
    ```bash
    git commit -m "Initial commit - Kingdom of Christ Ministries Website"
    ```
5.  Go to [GitHub.com](https://github.com/new) and **create a new repository**.
    - Name it something like `koc-ministries`.
    - Make it **Public** or **Private** (Private is recommended if you have API keys, but we are using simulated ones for now, so mostly safe).
6.  Connect your local folder to GitHub (replace `YOUR_USERNAME` and `YOUR_REPO` with actuals):
    ```bash
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/koc-ministries.git
    git push -u origin main
    ```

## Step 2: Deploy to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your `koc-ministries` repository from the list and click **"Import"**.

## Step 3: Configure Environment Variables

In the configuration screen on Vercel:
1.  Scroll down to **"Environment Variables"**.
2.  You need to add the following variables (copy values from your `.env.local` file):
    - `NEXTAUTH_SECRET`: (Generate a random string or use the one from your local file)
    - `NEXTAUTH_URL`: Set this to your Vercel URL after deployment (e.g., `https://koc-ministries.vercel.app`) - *Initially you can leave this blank or prompt Vercel to handle it.*
    - `GOOGLE_CLIENT_ID` / `Gemini` keys: If you added real keys, add them here. If you are using my simulated AI mode, you might not strictly need them yet, but it's good practice.

3.  Click **"Deploy"**.

## Step 4: Finalize

Vercel will build your site. Once it's done (about 1 minute), you will get a live URL (like `https://koc-ministries.vercel.app`).
You can share this link with your church members immediately!

## Updating the Site
Whenever you make changes (like adding new events), just run:
```bash
git add .
git commit -m "Updated events"
git push
```
Vercel will automatically detect the push and update your live website within minutes.
