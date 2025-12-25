
import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 100%;
          --card: 0 0% 8%;
          --card-foreground: 0 0% 100%;
          --popover: 0 0% 8%;
          --popover-foreground: 0 0% 100%;
          --primary: 24 95% 53%;
          --primary-foreground: 0 0% 100%;
          --secondary: 0 0% 15%;
          --secondary-foreground: 0 0% 100%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 60%;
          --accent: 0 0% 15%;
          --accent-foreground: 0 0% 100%;
          --border: 0 0% 15%;
          --input: 0 0% 15%;
          --ring: 24 95% 53%;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      {children}
    </div>
  );
}
