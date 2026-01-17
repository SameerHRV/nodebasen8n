import { requireAuth } from "@/lib/auth-utils";
import HomeClient from "./HomeClient";

export default async function Home() {
  await requireAuth();
  return <HomeClient />;
}
