import DashboardHeader from "@/components/layout/DashboardHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col h-screen w-full relative z-10 bg-transparent overflow-hidden">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto bg-transparent min-h-0">
        {children}
      </main>
    </div>
  );
}
