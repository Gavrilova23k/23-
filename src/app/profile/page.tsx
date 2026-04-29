'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/components/providers/AuthProvider';
import '@/styles/profile.css';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  bio?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { goBack } = useHistory();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Загрузка профиля из localStorage
  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: '',
          city: '',
          bio: '',
        });
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Если пользователь не авторизован - показываем форму входа
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-emoji">🔐</span>
            </div>
            <h1>Вход в профиль</h1>
            <p className="profile-email">Войдите, чтобы просмотреть и редактировать профиль</p>
          </div>
          
          <div className="profile-actions">
            <button onClick={() => router.push('/auth')} className="action-button">
              Войти / Зарегистрироваться
            </button>
          </div>
          
          <div className="profile-footer">
            <button onClick={goBack} className="action-button secondary">
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-emoji">👤</span>
          </div>
          <h1>Мой профиль</h1>
          <p className="profile-email">{profile.email}</p>
        </div>

        {saveSuccess && (
          <div className="success-message">✅ Профиль успешно сохранен!</div>
        )}

        <div className="profile-info">
          <div className="info-group">
            <label>Имя</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Ваше имя"
              />
            ) : (
              <p className="info-value">{profile.name || 'Не указано'}</p>
            )}
          </div>

          <div className="info-group">
            <label>Email</label>
            <p className="info-value email-value">{profile.email}</p>
          </div>

          <div className="info-group">
            <label>📱 Телефон</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+7 (999) 123-45-67"
              />
            ) : (
              <p className="info-value">{profile.phone || 'Не указан'}</p>
            )}
          </div>

          <div className="info-group">
            <label>🏙️ Город</label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="Ваш город"
              />
            ) : (
              <p className="info-value">{profile.city || 'Не указан'}</p>
            )}
          </div>

          <div className="info-group">
            <label>📝 О себе</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Расскажите о себе..."
                rows={3}
              />
            ) : (
              <p className="info-value bio-value">{profile.bio || 'Не указано'}</p>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                className="action-button save-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : '💾 Сохранить'}
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="action-button secondary cancel-btn"
              >
                Отмена
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="action-button edit-btn"
            >
              ✏️ Редактировать профиль
            </button>
          )}
        </div>

        <div className="profile-footer">
          <button onClick={goBack} className="action-button secondary">
            ← Назад
          </button>
          <button onClick={signOut} className="logout-profile-btn">
            🚪 Выйти
          </button>
        </div>
      </div>
    </div>
  );
}