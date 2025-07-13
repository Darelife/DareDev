import React from "react";
import { load } from 'js-yaml';
import ScrollVelocity from './ScrollVelocity';

export default function Projects() {
  const [projects, setProjects] = React.useState<any[]>([]);
  const [showProjects, setShowProjects] = React.useState(false);
  const projectsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const projectsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowProjects(true);
        } else {
          setShowProjects(false);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (projectsRef.current) {
      projectsObserver.observe(projectsRef.current);
    }

    return () => {
      if (projectsRef.current) {
        projectsObserver.unobserve(projectsRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    fetch('/projects.yaml')
      .then(response => response.text())
      .then(yamlText => {
        try {
          const data = load(yamlText) as any;
          setProjects(data.projects || []);
        } catch (error) {
          console.error('Error parsing YAML:', error);
          const lines = yamlText.split('\n');
          const projectsData: any[] = [];
          let currentProject: any = null;
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- title:')) {
              if (currentProject) projectsData.push(currentProject);
              currentProject = { title: trimmed.split('"')[1], links: [], techstack: [] };
            } else if (trimmed.startsWith('desc:')) {
              if (currentProject) currentProject.desc = trimmed.split('"')[1];
            } else if (trimmed.startsWith('- url:')) {
              // Handle links with text format: - url: "http://..."
              const url = trimmed.split('"')[1];
              const nextLine = lines[lines.indexOf(line) + 1]?.trim();
              if (nextLine && nextLine.startsWith('  text:')) {
                const text = nextLine.split('"')[1];
                if (currentProject) currentProject.links.push({ url, text });
              }
            } else if (trimmed.startsWith('- "http')) {
              // Handle legacy format: - "http://..."
              if (currentProject) currentProject.links.push(trimmed.slice(3, -1));
            } else if (trimmed.startsWith('- "') && currentProject?.techstack !== undefined) {
              if (currentProject) currentProject.techstack.push(trimmed.slice(3, -1));
            }
          });
          if (currentProject) projectsData.push(currentProject);
          setProjects(projectsData);
        }
      });
  }, []);

  return (
    <div className="bg-black text-white p-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Spacer to create gap after page.tsx animations */}
        {/* <div className="h-[20vh]"></div> */}
        
        {/* Heading section */}
        <div className="pb-16 text-center">
          <ScrollVelocity texts={['My Projects']} velocity={100} className="text-white" />
          <ScrollVelocity texts={['Enjoy']} velocity={-75} className="text-white" />
        </div>

        <div className="p-[3rem]"></div>
        
        {/* Projects section */}
        {/* <motion.div
          ref={projectsRef}
          initial={{ opacity: 0, y: 50 }}
          animate={showProjects ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        > */}
        <div ref={projectsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg transition-all duration-300"
            >
              {/* Project Number Badge */}
              <div className="absolute top-0 right-0 bg-red-500/20 text-red-300 text-sm font-mono px-3 py-1 rounded-bl-lg">
                #{index + 1}
              </div>
              
              <div className="p-6">
                {/* Project Title */}
                <h3 className="text-red-400 text-2xl font-bold mb-3 border-b border-gray-700 pb-3">
                  {project.title}
                </h3>
                
                {/* Project Description */}
                <div className="text-gray-300 mb-6 leading-relaxed">
                  {project.desc}
                </div>
                
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  {/* Tech Stack */}
                  {project.techstack && project.techstack.length > 0 && (
                    <div className="flex-grow">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.techstack.map((tech: string, i: number) => (
                          <span key={i} className="bg-gray-800/50 text-gray-300 px-2.5 py-1 text-xs rounded-md border border-gray-700 hover:border-red-500/30 transition-colors">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Links as Icons */}
                  {project.links && project.links.length > 0 && (
                    <div className="flex gap-3 ml-auto">
                      {project.links.map((linkObj: any, i: number) => {
                        // Handle both string links and object links with text
                        const link = typeof linkObj === 'string' ? linkObj : linkObj.url;
                        const linkText = typeof linkObj === 'string' ? '' : linkObj.text;
                        
                        // Extract domain name for hover text if no custom text
                        const domain = new URL(link).hostname.replace('www.', '');
                        
                        // Default icon type based on URL or use custom text
                        let displayText = linkText || domain;
                        let iconType = 'external';
                        
                        if (link.includes('github.com')) {
                          iconType = 'github';
                          displayText = linkText || 'View on GitHub';
                        } else if (link.includes('youtube.com')) {
                          iconType = 'youtube';
                          displayText = linkText || 'Watch Demo';
                        } else if (link.includes('codepen.io')) {
                          iconType = 'codepen';
                          displayText = linkText || 'View on CodePen';
                        }
                        
                        return (
                          <div key={i} className="relative group/link z-10">
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 hover:bg-red-500/30 text-white hover:text-white transition-colors"
                              aria-label={displayText}
                            >
                              {iconType === 'github' ? (
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                                </svg>
                              ) : iconType === 'youtube' ? (
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21.582 7.15a2.513 2.513 0 0 0-1.768-1.768C18.254 5 12 5 12 5s-6.254 0-7.814.382a2.513 2.513 0 0 0-1.768 1.768C2.036 8.71 2.036 12 2.036 12s0 3.29.382 4.85a2.513 2.513 0 0 0 1.768 1.768C5.746 19 12 19 12 19s6.254 0 7.814-.382a2.513 2.513 0 0 0 1.768-1.768C22 15.29 22 12 22 12s0-3.29-.418-4.85zM9.955 15.182V8.818L15.5 12l-5.545 3.182z"/>
                                </svg>
                              ) : (
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/>
                                </svg>
                              )}
                            </a>
                            {/* Tooltip positioned absolutely but visible outside container */}
                            <div className="fixed z-50 opacity-0 invisible group-hover/link:opacity-100 group-hover/link:visible transition-all duration-200 -translate-y-full -translate-x-1/2 left-1/2 top-0 pointer-events-none mb-3 transform">
                              <div className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                {displayText}
                              </div>
                              <div className="w-2 h-2 bg-black/90 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* </motion.div> */}
      </div>
    </div>
  );
}