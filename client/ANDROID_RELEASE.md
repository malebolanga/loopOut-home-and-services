# Android release checklist

LoopOut now runs from bundled app files in the Android shell. It does not load
the development server on a private network. Release builds use HTTPS for the
bundled app origin and must use a public HTTPS API.

## Build configuration

1. Copy `.env.android.example` to `.env.android`.
2. Set `VITE_API_BASE_URL` to the public **HTTPS** URL of the deployed API,
   without a trailing slash. For example: `https://api.your-domain.com`.
3. From this `client` directory, run:

   ```powershell
   npm run sync:android
   ```

This produces the web bundle and copies it into `android/app/src/main/assets`.

## Debug test

Open the native project in Android Studio with:

```powershell
npm run open:android
```

Choose an emulator or USB-connected Android device, then run the `app`
configuration. Test sign-in, listings, booking, payments, images, and logout
on a real network before release.

## Play Store build

In Android Studio, use **Build > Generate Signed Bundle / APK > Android App
Bundle**, create or select the upload key, then upload the resulting `.aab` to
Google Play Console. Keep the signing key outside this repository and backed up
securely.

`com.loupeout.app` is the Android application ID. It becomes permanent once
published, so confirm it before the first Play Store release.
