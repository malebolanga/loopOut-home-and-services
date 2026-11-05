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

1. Create an upload key once (keep it and its passwords outside this repository and back them up):

   ```powershell
   keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. Create `client/android/keystore.properties` (git-ignored):

   ```properties
   storeFile=C:/secure/path/upload-keystore.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
   ```

3. Build the signed bundle from the `client` directory:

   ```powershell
   npm run build:android
   npx cap sync android
   cd android
   .\gradlew.bat bundleRelease
   ```

   The upload file is `android/app/build/outputs/bundle/release/app-release.aab`.
4. Increase `versionCode` in `android/app/build.gradle` for every upload to Google Play.

`com.loupeout.app` is the Android application ID. It becomes permanent once
published, so confirm it before the first Play Store release.
