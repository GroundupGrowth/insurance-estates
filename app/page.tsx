import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";

export default async function Home() {
  const user = await stackServerApp.getUser();
  redirect(user ? "/dashboard" : "/login");
}
