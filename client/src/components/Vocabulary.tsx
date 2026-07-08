import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import VocabCard from './VocabCard';

export default function Vocabulary() {
  const [sortOrder, setSortOrder] = useState('newest');

  const { data: res, isLoading } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => api<{ success: boolean; data: any[] }>('/api/vocabulary'),
  });

  const getSortedData = () => {
    if (!res?.data) return [];
    const arr = [...res.data];
    switch (sortOrder) {
      case 'newest': return arr;
      case 'oldest': return arr.reverse();
      case 'az': return arr.sort((a: any, b: any) => a.word.localeCompare(b.word));
      case 'most_reviewed': return arr.sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default: return arr;
    }
  };

  const sortedData = getSortedData();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Vocabulary Review</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Words extracted from your conversations.</p>
        </div>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
          className="w-full sm:w-auto bg-input border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A - Z</option>
          <option value="most_reviewed">Most Reviewed</option>
        </select>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-12 text-muted-foreground">Loading vocabulary...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedData.map((vocab: any) => <VocabCard key={vocab.id} vocab={vocab} />)}
          {sortedData.length === 0 && (
            <div className="text-center p-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No vocabulary to review right now.</p>
              <p className="text-sm mt-2">Chat with Emma to discover new words!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
