// app/activities/layout.tsx

import React from 'react';

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
