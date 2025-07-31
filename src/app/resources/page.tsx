import React from "react";
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import TextReveal from '../../components/TextReveal';
import Navbar from '../../components/navbar';

const Resources = () => {
  const resourcesFilePath = path.join(process.cwd(), 'public', 'resources.json');
  const resourcesData = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf8'));

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

  return (
    <div className="bg-black text-white p-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto">
        
        {/* Heading section */}
        <div className="mt-16 p-16 text-center">
          <TextReveal
            text="LEARNING RESOURCES"
            className="text-5xl md:text-7xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "sans-serif",
              fontWeight: "bold",
              letterSpacing: "-0.02em", 
              filter: "drop-shadow(0 4px 8px rgba(255,0,0,0.3))",
              justifyContent: "center",
              marginBottom: "0.5rem"
            }}
          />
          
          <TextReveal
            text="MY PERSONAL LEARNING POCKET"
            className="text-2xl md:text-3xl text-red-400 mb-8"
            style={{
              fontFamily: "sans-serif",
              fontWeight: "600",
              letterSpacing: "0.05em",
              justifyContent: "center",
              opacity: 0.8
            }}
          />
        </div>

        {/* Resources by Category */}
        {Object.entries(resourcesData).map(([category, resources]) => (
          <div key={category} className="mb-8 px-4">
            {/* Category Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">
                  {category}
                </h2>
                <div className="text-gray-400 text-sm">
                  {(resources as any[]).length} resources • 
                  {(resources as any[]).filter(r => r.status === 2).length} completed • 
                  {(resources as any[]).filter(r => r.status === 1).length} in progress
                </div>
              </div>
              <Link 
                href={`/resources/${category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className="text-red-400 hover:text-red-300 text-sm font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            
            {/* Horizontal Scrolling Resources */}
            <div className="overflow-x-auto pb-4 -mx-2 px-2">
              <div className="flex gap-5 min-w-max">
                {(resources as any[]).slice(0, 5).map((resource: any, index: number) => (
                  <div 
                  key={index} 
                  className="flex-shrink-0 w-72 mt-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-700/50"
                  >
                  {/* Status Indicator */}
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(resource.status)}`}></div>
                    <span className="text-xs text-gray-400 font-medium">{getStatusText(resource.status)}</span>
                  </div>
                  
                  <div className="p-4 pt-2">
                    {/* Resource Title */}
                    <h3 className="text-red-400 text-base font-semibold mb-3 border-b border-gray-700/70 pb-2">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-red-300 transition-colors"
                    >
                      {resource.title}
                    </a>
                    </h3>
                    
                    {/* Resource Description */}
                    <div className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {resource.description}
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
