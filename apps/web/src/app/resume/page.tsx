import Navbar from "@/components/navbar";

const resumeUrl = "/resume/file";

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-(--appearance-canvas,#000)">
      <Navbar />
      <iframe
        src={resumeUrl}
        title="Prakhar Bhandari's resume"
        className="block h-[calc(100vh-64px)] min-h-180 w-full border-0"
      />
    </main>
  );
}
