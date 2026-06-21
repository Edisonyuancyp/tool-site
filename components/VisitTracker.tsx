"use client";
import { useEffect } from "react";
import { useWorkbench } from "@/lib/WorkbenchContext";

export default function VisitTracker({ slug }: { slug: string }) {
  const { recordVisit } = useWorkbench();
  useEffect(() => { recordVisit(slug); }, [slug, recordVisit]);
  return null;
}
