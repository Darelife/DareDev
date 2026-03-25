import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { category } = await params;
  void category;
  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center" style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div className="text-center">
        <p className="text-red-500/50 text-xs tracking-widest uppercase mb-4">moved</p>
        <Link href="/resources" className="text-white/40 hover:text-white transition-colors text-sm">
          ← back to resources
        </Link>
      </div>
    </div>
  );
};

export async function generateStaticParams() {
  const resourcesFilePath = path.join(process.cwd(), 'public', 'resources.json');
  const resourcesData = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf8'));
  return Object.keys(resourcesData).map((category) => ({
    category: category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
  }));
}

export default CategoryPage;
