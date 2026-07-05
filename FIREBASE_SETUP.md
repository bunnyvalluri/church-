# Firebase Authentication Setup

To make the Login page work, you need to set up Firebase in your project.

## Step 1: Create a Firebase Project
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the steps (name it "Church App").
3.  Once created, click the **Web icon (</>)** to register your app.
4.  Copy the `firebaseConfig` object values.

## Step 2: Add Keys to `.env.local`
Open your `.env.local` file and add these variables (replace with your copied values):

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

## Step 3: Enable Authentication Providers
1.  In Firebase Console, go to **Build** -> **Authentication**.
2.  Click **"Get Started"**.
3.  Go to the **Sign-in method** tab.
4.  Enable **Email/Password**.
5.  Enable **Google**.
    - For Google, you usually don't need extra setup for `localhost` (though using `127.0.0.1` is not authorized by default).
    - For production and deployed previews (e.g., `kcmchurch.vercel.app`), you **must** add the domain to **"Authorized domains"** in Firebase settings.

    ### How to add Authorized Domains to Firebase:
    1. In the [Firebase Console](https://console.firebase.google.com/), select your project.
    2. Go to **Build** -> **Authentication**.
    3. Click on the **Settings** tab.
    4. Choose **Authorized domains** on the left panel.
    5. Click **"Add domain"** and enter `kcmchurch.vercel.app` (and any other domain/IP or preview URL you use to access the site).
    6. Click **Add** to save.
6.  Enable **Facebook**.
    - You will need a developer account on the [Facebook Developers Portal](https://developers.facebook.com/).
    - Create a new App, select the "Use cases" or "Facebook Login", and configure the App ID and App Secret.
    - Copy the "OAuth redirect URI" provided by Firebase (under the Facebook provider setup) and paste it into your Facebook App settings under Facebook Login Client OAuth Settings.
    - Enter your Facebook **App ID** and **App Secret** in the Firebase Console setup for Facebook and save.
7.  Enable **Twitter (X)**.
    - You will need a developer account on the [X Developer Portal](https://developer.x.com/).
    - Set up a Project and App in the X Developer Portal with User Authentication settings enabled (OAuth 2.0 or OAuth 1.0a).
    - Copy the "OAuth redirect URI" from your Firebase Console's Twitter sign-in setup page.
    - Paste this redirect URI into your X App settings under **Callback URI / Redirect URL**.
    - Enter your Twitter **API Key (Consumer Key)** and **API Key Secret (Consumer Secret)** in the Firebase Console setup for Twitter and save.

## Step 4: Add Real Users
You can now go to `/register` (if implemented) or manually add users in the Firebase Console "Users" tab to test logging in.
