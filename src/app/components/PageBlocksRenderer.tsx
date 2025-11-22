"use client";

import { ReactNode } from "react";

export interface PageBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'quote';
  content: any;
}

interface PageBlocksRendererProps {
  blocks: PageBlock[];
  className?: string;
}

export function PageBlocksRenderer({ blocks, className = "" }: PageBlocksRendererProps) {
  const renderBlock = (block: PageBlock): ReactNode => {
    switch (block.type) {
      case 'heading':
        const level = block.content.level || 2;
        const headingClasses = {
          2: "text-3xl font-bold text-gray-900 mb-6",
          3: "text-2xl font-semibold text-gray-800 mb-4", 
          4: "text-xl font-medium text-gray-700 mb-3"
        };
        
        if (level === 2) {
          return (
            <h2 key={block.id} className={headingClasses[2]}>
              {block.content.text}
            </h2>
          );
        } else if (level === 3) {
          return (
            <h3 key={block.id} className={headingClasses[3]}>
              {block.content.text}
            </h3>
          );
        } else if (level === 4) {
          return (
            <h4 key={block.id} className={headingClasses[4]}>
              {block.content.text}
            </h4>
          );
        } else {
          return (
            <h2 key={block.id} className={headingClasses[2]}>
              {block.content.text}
            </h2>
          );
        }

      case 'paragraph':
        return (
          <p key={block.id} className="text-gray-600 mb-4 leading-relaxed">
            {block.content.text}
          </p>
        );

      case 'list':
        const ListTag = block.content.type === 'ordered' ? 'ol' : 'ul';
        const listClasses = block.content.type === 'ordered' 
          ? "list-decimal list-inside mb-4 text-gray-600 space-y-2"
          : "list-disc list-inside mb-4 text-gray-600 space-y-2";

        return (
          <ListTag key={block.id} className={listClasses}>
            {(block.content.items || []).map((item: string, index: number) => (
              <li key={index} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ListTag>
        );

      case 'image':
        if (!block.content.src) return null;
        
        return (
          <figure key={block.id} className="mb-6">
            <img 
              src={block.content.src} 
              alt={block.content.alt || ''} 
              className="w-full h-auto rounded-lg shadow-md" loading="lazy"
            />
            {block.content.caption && (
              <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 border-blue-500 pl-6 mb-6 italic">
            <p className="text-gray-700 text-lg mb-2">
              "{block.content.text}"
            </p>
            {block.content.author && (
              <cite className="text-gray-500 text-sm not-italic">
                — {block.content.author}
              </cite>
            )}
          </blockquote>
        );

      default:
        console.warn(`Неизвестный тип блока: ${block.type}`);
        return null;
    }
  };

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={`page-blocks-content ${className}`}>
      {blocks.map(renderBlock)}
    </div>
  );
}