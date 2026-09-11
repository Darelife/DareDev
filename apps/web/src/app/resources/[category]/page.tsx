import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { category } = await params;
  void category;
  return (
    <div className="bg-[var(--appearance-canvas,#000)] min-h-screen text-[color:var(--appearance-ink,#fff)] flex items-center justify-center" style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div className="text-center">
        <p className="text-[color:var(--appearance-accent,color-mix(in_oklab,oklch(63.7%_0.237_25.331)_50%,transparent))] text-xs tracking-widest uppercase mb-4">moved</p>
        <Link href="/resources" className="text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_40%,transparent))] hover:text-[color:var(--appearance-ink,#fff)] transition-colors text-sm">
          ← back to resources
        </Link>
      </div>
    </div>
  );
};

export default CategoryPage;
