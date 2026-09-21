# iOS release checklist

The iOS app uses Capacitor with bundled web files. Build the app only against
a public HTTPS API; `localhost` will not work on a phone or in TestFlight.

## Prepare the release

1. In `client/.env`, set the production API address (without a trailing slash):

   ```env
   VITE_API_BASE_URL=https://api.your-domain.com
   ```

2. On a Mac with Xcode installed, from this `client` directory run:

   ```bash
   npm ci
   npm run sync:ios
   npm run open:ios
   ```

3. In Xcode, select the **App** target and set your Apple Developer team under
   **Signing & Capabilities**. Confirm that `com.loupeout.app` is the final
   bundle identifier before the first App Store upload.

4. Set the release version and build number in the **General** tab, test on a
   real device, then select **Product > Archive**.

5. Choose **Distribute App > App Store Connect > Upload**. Use TestFlight for
   tester distribution and complete the App Store Connect listing for review.

Do not commit `.env` or Apple signing certificates/profiles.
