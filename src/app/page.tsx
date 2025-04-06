// src/app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  // In future: check auth status
  redirect("/login")
}
