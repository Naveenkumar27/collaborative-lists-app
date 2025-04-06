"use client"

/**
 * DashboardContent is the default screen shown on the dashboard
 * when no specific list is selected. It's a welcoming placeholder.
 */
export function DashboardContent() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to RoomieLists</h1>
        <p className="text-muted-foreground">
          Select a list from the sidebar or create a new one.
        </p>
      </main>
    </div>
  )
}
