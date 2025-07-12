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
            } else if (trimmed.startsWith('- "http')) {
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
          {projects.map((project, index) => (
            <div key={index} className="mb-8 border border-gray-600 p-4 bg-gray-900 rounded-lg">
              <div className="text-red-300 text-lg mb-2">
          [{index + 1}] {project.title}
              </div>
              
              <div className="text-gray-300 mb-3 pl-4">
          {project.desc}
              </div>
              
              <div className="mb-3">
          <span className="text-white">Links:</span>
          <div className="pl-4">
            {project.links?.map((link: string, i: number) => (
              <div key={i} className="text-red-200 hover:underline cursor-pointer">
                → <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              </div>
            ))}
          </div>
              </div>
              
              <div>
          <span className="text-white">Tech Stack:</span>
          <div className="pl-4 flex flex-wrap gap-2">
            {project.techstack?.map((tech: string, i: number) => (
              <span key={i} className="bg-gray-700 text-gray-200 px-2 py-1 text-sm rounded">
                {tech}
              </span>
            ))}
          </div>
              </div>
            </div>
          ))}
        {/* </motion.div> */}
      </div>
    </div>
  );
}