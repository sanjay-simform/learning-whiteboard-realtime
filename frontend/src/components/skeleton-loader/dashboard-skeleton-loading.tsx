export default function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-72 border-r bg-muted/20 lg:flex lg:flex-col">
        <div className="border-b p-6">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl px-3 py-3"
            >
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted/80" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-xl border bg-background p-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted/80" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted lg:hidden" />
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted/80" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-6 p-6">
          {/* Stats Grid */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  </div>

                  <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
                </div>

                <div className="mt-6 h-3 w-32 animate-pulse rounded bg-muted/80" />
              </div>
            ))}
          </section>

          {/* Charts + Activity */}
          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 shadow-sm xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-52 animate-pulse rounded bg-muted/80" />
                </div>

                <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
              </div>

              <div className="flex h-[320px] items-end gap-3">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="flex flex-1 flex-col justify-end">
                    <div
                      className="animate-pulse rounded-t-xl bg-muted"
                      style={{
                        height: `${40 + ((index * 37) % 180)}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-6 space-y-2">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted/80" />
              </div>

              <div className="space-y-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />

                    <div className="flex flex-1 flex-col gap-2">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      <div className="h-3 w-3/4 animate-pulse rounded bg-muted/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Table Skeleton */}
          <section className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted/80" />
              </div>

              <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
            </div>

            <div className="overflow-hidden">
              <div className="grid grid-cols-5 gap-4 border-b px-6 py-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-4 animate-pulse rounded bg-muted"
                  />
                ))}
              </div>

              {Array.from({ length: 7 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-5 gap-4 border-b px-6 py-5 last:border-none"
                >
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-4 animate-pulse rounded bg-muted/90"
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
