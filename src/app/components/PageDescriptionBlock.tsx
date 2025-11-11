"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { PageBlocksRenderer } from "./PageBlocksRenderer";
import type { PageBlock } from "./PageBlocksRenderer";

interface PageDescriptionBlockProps {
  pageSlug: string;
  className?: string;
}

export function PageDescriptionBlock({ pageSlug, className = "" }: PageDescriptionBlockProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageDescription = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/page-descriptions/${pageSlug}`);
        
        if (data.success && data.data) {
          setBlocks(data.data.blocks || []);
        }
      } catch (err) {
        console.error("Ошибка загрузки описания страницы:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageDescription();
  }, [pageSlug]);

  if (loading || blocks.length === 0) {
    return null;
  }

  return <PageBlocksRenderer blocks={blocks} className={`mt-7.5 ${className}`} />;
}
