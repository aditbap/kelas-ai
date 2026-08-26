'use client';

import { useEffect } from 'react';

import { useSidebar } from '@/components/sidebar-context';

import type { CourseOutlineData } from '@/components/sidebar-context';

/*
  The outline is fetched server-side alongside the rest of the module page,
  but needs to render inside the app shell's sidebar (a sibling, not an
  ancestor, of this page). Pushing it into shared context on mount is the
  smallest way to bridge that without lifting data-fetching into the layout.
*/
export function SyncCourseOutline(props: CourseOutlineData) {
  const { setCourseOutline } = useSidebar();

  useEffect(() => {
    setCourseOutline(props);
    return () => setCourseOutline(null);
    // props is a fresh object each render; re-sync only when the identifying fields actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.moduleId, props.currentItemId, props.overallPercent]);

  return null;
}
