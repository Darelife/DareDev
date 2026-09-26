const resumeUrl = "https://raw.githubusercontent.com/darelife/resume/main/resume.pdf";

export async function GET() {
  const response = await fetch(resumeUrl, { next: { revalidate: 300 } });

  if (!response.ok || !response.body) {
    return new Response("Unable to load resume", { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=resume.pdf",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
