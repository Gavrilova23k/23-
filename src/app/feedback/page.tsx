'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/components/providers/AuthProvider';
import '@/styles/App1.css';

interface FeedbackValues {
  cityId: number;
  message: string;
  rating: number;
}

export default function FeedbackPage() {
  const router = useRouter();
  const { goBack } = useNavigationHistory();
  const { user } = useAuth();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { data: cities } = trpc.city.getAll.useQuery({});
  const { data: myFeedbacks, refetch: refetchMyFeedbacks } = trpc.feedback.getMyFeedbacks.useQuery(undefined, {
    enabled: !!user,
  });
  
  const addFeedback = trpc.feedback.add.useMutation({
    onSuccess: () => {
      refetchMyFeedbacks();
      setMessage('');
      setRating(5);
      setSelectedCityId(null);
      setSuccessMessage('✅ Отзыв успешно добавлен!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      console.error('Add feedback error:', error);
      setErrorMessage('❌ Ошибка при добавлении отзыва. Попробуйте позже.');
      setTimeout(() => setErrorMessage(null), 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!user) {
      alert('Войдите в систему, чтобы оставить отзыв');
      router.push('/auth');
      return;
    }
    
    if (!selectedCityId) {
      alert('Выберите город');
      return;
    }
    
    if (message.trim().length < 5) {
      alert('Отзыв должен содержать минимум 5 символов');
      return;
    }
    
    addFeedback.mutate({
      cityId: selectedCityId,
      message: message.trim(),
      rating,
    });
  };

  // Функция для форматирования даты из Unix timestamp (секунды)
  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return 'Дата не указана';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Дата не указана';
    }
  };

  if (!user) {
    return (
      <div className="feedback-container">
        <h1>📝 Отзывы</h1>
        <p>Войдите в систему, чтобы оставить отзыв</p>
        <button onClick={() => router.push('/auth')} className="action-button">
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <h1>📝 Оставить отзыв</h1>
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>Выберите город:</label>
          <select
            value={selectedCityId || ''}
            onChange={(e) => setSelectedCityId(Number(e.target.value))}
            required
            className="form-input"
          >
            <option value="">-- Выберите город --</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Оценка:</label>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`star-btn ${star <= rating ? 'active' : ''}`}
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Ваш отзыв:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишите ваш отзыв здесь..."
            required
            rows={5}
            className="form-textarea"
          />
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            className="action-button" 
            disabled={addFeedback.isLoading}
          >
            {addFeedback.isLoading ? 'Отправка...' : '📨 Отправить отзыв'}
          </button>
        </div>
      </form>
      
      <div className="feedback-history">
        <h2>📋 Мои отзывы</h2>
        {!myFeedbacks || myFeedbacks.length === 0 ? (
          <p>У вас пока нет отзывов. Будьте первым!</p>
        ) : (
          <ul className="feedbacks-list">
            {myFeedbacks.map((feedback) => (
              <li key={feedback.id} className="feedback-item">
                <div className="feedback-header">
                  <strong className="feedback-city">{feedback.cityName}</strong>
                  <span className="feedback-rating">{'⭐'.repeat(feedback.rating)}</span>
                </div>
                <p className="feedback-message">{feedback.message}</p>
                <div className="feedback-footer">
                  <small className="feedback-date">
                    📅 {formatDate(feedback.createdAt)}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}