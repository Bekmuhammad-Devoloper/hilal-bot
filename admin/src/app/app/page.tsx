import { headers } from "next/headers";
import { unstable_noStore } from "next/cache";
import MiniAppClient from "./MiniApp";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function AppPage() {
  unstable_noStore();
  headers();
  return <MiniAppClient />;
}
