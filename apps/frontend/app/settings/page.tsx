import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from "@/app/auth/anonymous";
import ModuleLayout from "../components/ModuleLayout";
import SettingsPanel from "./SettingsPanel";

export default async function SettingsPage() {
  const session = await auth();
  const isAnonymous = isAnonymousCookie(cookies().get(ANONYMOUS_COOKIE_NAME)?.value);

  if (!session && !isAnonymous) {
    redirect("/sign-in?callbackUrl=%2Fsettings");
  }

  return (
    <ModuleLayout titleKey="app.settings.title">
      <SettingsPanel />
    </ModuleLayout>
  );
}
