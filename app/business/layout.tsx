import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  const biz = await getPrimaryBusinessForOwner(user.id);
  if (biz) redirect("/dashboard");
  return children;
}
