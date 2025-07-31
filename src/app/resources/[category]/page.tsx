import React from "react";
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import TextReveal from '../../../components/TextReveal';
import Navbar from '../../../components/navbar';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { category } = await params;
  
  // Read resources from JSON file
  const resourcesFilePath = path.join(process.cwd(), 'public', 'resources.json');
  const resourcesData = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf8'));
  
  // Convert URL slug back to category name
  const categoryName = category
    .split('-')
    .map(word => word === 'and' ? '&' : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Find the resources for this category
  const categoryResources = resourcesData[categoryName];
  
  if (!categoryResources) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Category Not Found</h1>
          <Link href="/resources" className="text-red-400 hover:underline">
            Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return 'bg-green-500';
      case 1:
        return 'bg-yellow-500';
      case 0:
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2:
        return 'Completed';
      case 1:
        return 'In Progress';
      case 0:
      default:
        return 'Not Started';
    }
  };

  const completedCount = categoryResources.filter((r: any) => r.status === 2).length;
  const inProgressCount = categoryResources.filter((r: any) => r.status === 1).length;
  const totalCount = categoryResources.length;

  return (
    <div className="bg-black text-white p-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <div className="mt-8 mb-8">
          <Link 
            href="/resources" 
            className="inline-flex items-center text-red-400 hover:text-red-300 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Resources
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center mb-16">
          <TextReveal
            text={categoryName.toUpperCase()}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "sans-serif",
              fontWeight: "bold",
              letterSpacing: "-0.02em", 
              filter: "drop-shadow(0 4px 8px rgba(255,0,0,0.3))",
              justifyContent: "center",
              marginBottom: "1rem"
            }}
          />
          
          <div className="text-lg text-gray-400 mb-8">
            {totalCount} total resources • {completedCount} completed • {inProgressCount} in progress
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto bg-gray-800 rounded-full h-3 mb-8">
            <div 
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryResources.map((resource: any, index: number) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {/* Status Indicator */}
              <div className="p-4 pb-0 flex items-center justify-between">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(resource.status)}`}></div>
                <span className="text-sm text-gray-400 font-medium">{getStatusText(resource.status)}</span>
              </div>
              
              <div className="p-4 pt-2">
                {/* Resource Title */}
                <h3 className="text-red-400 text-xl font-bold mb-3 border-b border-gray-700 pb-2">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {resource.title}
                  </a>
                </h3>
                
                {/* Resource Description */}
                <div className="text-gray-300 text-sm leading-relaxed mb-4">
                  {resource.description}
                </div>
                
                {/* Action Button */}
                <div className="flex justify-between items-center">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Open Resource
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    resource.status === 2 ? 'bg-green-500/20 text-green-300' :
                    resource.status === 1 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {getStatusText(resource.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
