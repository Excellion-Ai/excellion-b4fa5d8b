import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";

// Lazy load footer only when it comes into view
const LazyFooter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: "100px" } // Load 100px before it comes into view
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <div ref={footerRef}>
      {isVisible ? <Footer /> : <div className="h-64" />}
    </div>
  );
};

export default LazyFooter;
