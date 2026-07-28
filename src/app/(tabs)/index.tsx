// src/app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Automatically redirect users to the photo upload screen
  return <Redirect href="/photo-upload" />;
}
