"use client";
import { C, MN } from "@/lib/theme";

export default function SponsorSlot({ id }) {
  // 3 states: empty (returns null), admob (future), sponsor (future - admin configures)
  // For now all slots return null (invisible)
  // When ready: fetch config from Supabase table "sponsors" by slot id
  return null;
}
