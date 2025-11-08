import { useEffect, useRef, useState } from 'react';
import { BookOpen, Pencil, GraduationCap, Lightbulb, Atom, Sparkles } from 'lucide-react';

interface FloatingElement {
  id: number;
  Icon: React.ElementType;
  x: number;
  y: number;
  z: number; // depth for parallax
  rotation: number;
  scale: number;
  speed: number;
}

export default function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef<number[]>([]);
  
  // Use state to trigger re-render and mount elements
  const [elements] = useState<FloatingElement[]>(() => {
    const icons = [BookOpen, Pencil, GraduationCap, Lightbulb, Atom, Sparkles];
    const elements: FloatingElement[] = [];
    
    for (let i = 0; i < 12; i++) {
      elements.push({
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 3 - 1.5, // -1.5 to 1.5 for depth
        rotation: Math.random() * 360,
        scale: 0.3 + Math.random() * 0.5,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
    
    // Initialize rotation ref
    rotationRef.current = elements.map(el => el.rotation);
    return elements;
  });

  useEffect(() => {

    // Mouse move handler for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize mouse position to -1 to 1
      mouseRef.current = {
        x: (clientX / innerWidth - 0.5) * 2,
        y: (clientY / innerHeight - 0.5) * 2,
      };
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      if (containerRef.current) {
        const domElements = containerRef.current.querySelectorAll('.floating-element');
        
        // Only animate if elements are mounted
        if (domElements.length > 0) {
          domElements.forEach((el, index) => {
            const element = elements[index];
            if (!element) return;

            // Apply parallax based on mouse position and element depth
            const parallaxX = mouseRef.current.x * element.z * 20;
            const parallaxY = mouseRef.current.y * element.z * 20;

            // Increment rotation
            rotationRef.current[index] += element.speed * 0.2;

            // Apply transform with parallax and rotation
            const translateX = `calc(${element.x}vw + ${parallaxX}px)`;
            const translateY = `calc(${element.y}vh + ${parallaxY}px)`;
            
            (el as HTMLElement).style.transform = `
              translate(${translateX}, ${translateY})
              rotate(${rotationRef.current[index]}deg)
              scale(${element.scale})
            `;
          });
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Start animation after a brief delay to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(animate);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [elements]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ perspective: '1000px' }}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/60" />
      
      {/* Floating academic elements */}
      {elements.map((element) => {
        const Icon = element.Icon;
        return (
          <div
            key={element.id}
            className="floating-element absolute transition-transform duration-300 ease-out"
            style={{
              left: 0,
              top: 0,
              opacity: 0.15 + element.z * 0.1,
              filter: element.z < 0 ? 'blur(2px)' : element.z > 0.5 ? 'blur(1px)' : 'none',
            }}
          >
            <Icon 
              className="text-primary" 
              size={40 + element.z * 20}
              strokeWidth={1.5}
            />
          </div>
        );
      })}
      
      {/* Particle grid for digital feel */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>
    </div>
  );
}
