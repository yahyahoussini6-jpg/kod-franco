import React, { useEffect, useRef, Suspense } from 'react';
import { cn } from '@/lib/utils';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = React.lazy(() => import('react-quill'));

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link', 'image'
];

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Tapez quelque chose...", 
  className,
  readOnly = false 
}: RichTextEditorProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    // Load Quill CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    document.head.appendChild(link);
    
    setIsLoaded(true);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className={cn(
        "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Chargement de l'éditeur...
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rich-text-editor", className)}>
      <React.Suspense fallback={
        <div className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chargement de l'éditeur...
          </div>
        </div>
      }>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          modules={modules}
          formats={formats}
          style={{
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.375rem',
          }}
        />
      </React.Suspense>
      
      <style>{`
        .ql-editor {
          min-height: 120px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background: hsl(var(--background));
        }
        
        .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background: hsl(var(--background));
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        
        .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .ql-toolbar .ql-picker-label {
          color: hsl(var(--foreground));
        }
        
        .ql-toolbar button:hover,
        .ql-toolbar button:focus {
          background-color: hsl(var(--muted));
          border-radius: 0.25rem;
        }
        
        .ql-toolbar button.ql-active {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 0.25rem;
        }
        
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary-foreground));
        }
        
        .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--primary-foreground));
        }
      `}</style>
    </div>
  );
}