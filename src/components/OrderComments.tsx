'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase, OrderComment } from '@/lib/supabase';
import { useTelegram } from '@/hooks/useTelegram';

interface OrderCommentsProps {
  orderId: string;
}

export default function OrderComments({ orderId }: OrderCommentsProps) {
  const { profile } = useTelegram();
  const [comments, setComments] = useState<OrderComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
    
    // Realtime подписка на новые комментарии
    const subscription = supabase
      .channel(`order-comments-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_comments',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          // Получаем полные данные комментария с информацией об авторе
          fetchCommentWithAuthor(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('order_comments')
        .select(`
          *,
          profiles!order_comments_author_id_fkey (
            first_name,
            username
          )
        `)
        .eq('order_id', orderId)
        .eq('is_internal', false) // Клиенты видят только внешние комментарии
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchCommentWithAuthor = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_comments')
        .select(`
          *,
          profiles!order_comments_author_id_fkey (
            first_name,
            username
          )
        `)
        .eq('id', commentId)
        .single();

      if (error) throw error;
      
      setComments(prev => {
        const exists = prev.find(c => c.id === commentId);
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching comment:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !profile?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('order_comments')
        .insert({
          order_id: orderId,
          author_id: profile.id,
          content: newComment.trim(),
          is_internal: false,
        });

      if (error) throw error;
      
      setNewComment('');
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Ошибка при отправке комментария');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-text-primary">💬 Обсуждение проекта</h3>
      
      {/* Список комментариев */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg ${
              comment.author_id === profile?.id
                ? 'bg-blue-500/20 ml-8'
                : 'bg-card border border-border mr-8'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-text-primary">
                {comment.author_id === profile?.id
                  ? 'Вы'
                  : comment.profiles?.first_name || 'Менеджер'}
              </span>
              <span className="text-xs text-text-subtle">
                {formatTime(comment.created_at)}
              </span>
            </div>
            <p className="text-text-secondary text-sm whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма нового комментария */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 p-3 bg-card border border-border rounded-lg text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isLoading}
          className="px-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '...' : '📨'}
        </button>
      </form>
    </div>
  );
}