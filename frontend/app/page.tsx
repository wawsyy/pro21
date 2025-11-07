import { StrengthTrackerDemo } from "@/components/StrengthTrackerDemo";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0 max-w-4xl mx-auto">
        <StrengthTrackerDemo />
      </div>
    </main>
  );
}



