"use client";
import { useEffect, useRef } from "react";
import { useWorkbench } from "@/lib/WorkbenchContext";
import { trackToolView, trackEngagementTime } from "@/lib/analytics";

interface Props {
  slug: string;
  name?: string;
  category?: string;
}

export default function VisitTracker({ slug, name, category }: Props) {
  const { recordVisit } = useWorkbench();
  const startRef = useRef(Date.now());

  useEffect(() => {
    recordVisit(slug);
    if (name && category) {
      trackToolView({ tool_slug: slug, tool_name: name, tool_category: category });
    }
    return () => {
      if (name) {
        trackEngagementTime({ tool_slug: slug, seconds: (Date.now() - startRef.current) / 1000 });
      }
    };
  }, [slug, name, category, recordVisit]);

  return null;
}
