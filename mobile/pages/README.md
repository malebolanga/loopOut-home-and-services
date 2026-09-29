# 📄 LoopOut Web Pages — Mobile Reference Sync

This folder contains a **synced copy** of all web pages from the React web client (`client/src/pages/`).

These are **reference copies** only — the live source of truth is always:

```
c:\loopOut-home-and-services\client\src\pages\
```

## 📦 Total Pages Synced
103 JSX page files

## 🔄 How to Re-Sync
Run this command from the project root to pull the latest changes:

```bash
xcopy "client\src\pages\*" "mobile\pages\" /Y /Q
```

## 📱 Mobile App Architecture
The Android app (`mobile/android/`) is a **React Native WebView** wrapper that loads the deployed web app. The pages here can be used as reference for:
- Building native React Native equivalents
- Understanding routing structure
- Feature parity checks

## 🗂️ Key Pages

| Page | Description |
|------|-------------|
| `Home.jsx` | Main home with food ordering (FoodDetailModal, order flow) |
| `Services.jsx` | Services marketplace |
| `Search.jsx` | Smart search |
| `Profile.jsx` | User profile |
| `DashBoard.jsx` | Admin/user dashboard |
| `LunchComingSoon.jsx` | Lunch/food ordering page |
| `Listing.jsx` | Property listings |
| `CreateListing.jsx` | Create new listing flow |
| `Notifications.jsx` | Push notifications |
| `HelperPage.jsx` | Helper marketplace |
