'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect, Suspense } from 'react';

interface FeedbackValues {
  name: string;
  email: string;
  message: string;
}

interface Feedback {
  name: string;
  email: string;
  message: string;
}

const FeedbackContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem('feedbackList');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    localStorage.setItem('feedbackList', JSON.stringify(feedbackList));
  }, [feedbackList]);

  const initialValues: FeedbackValues = {
    name: '',
    email: '',
    message: ''
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Обязательное поле')
      .min(2, 'Минимум 2 символа')
      .max(50, 'Максимум 50 символов'),
    email: Yup.string()
      .email('Некорректный email')
      .required('Обязательное поле'),
    message: Yup.string()
      .required('Обязательное поле')
      .min(10, 'Минимум 10 символов')
      .max(500, 'Максимум 500 символов')
  });

  const onSubmit = async (values: FeedbackValues, { setSubmitting, resetForm }: any) => {
    setFeedbackList((prev) => [...prev, values]);
    resetForm();
    
    setSuccessMessage('Отзыв успешно добавлен!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    
    setSubmitting(false);
  };

  const handleBack = () => {
    router.back();  // ← Вот так просто, как в React Router
  };

  return (
    <div className="feedback-container">
      <h1>Форма обратной связи 💬</h1>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form id="feedback-form" className="feedback-form">
            <div className="form-group">
              <label htmlFor="name">Ваше имя:</label>
              <Field 
                type="text" 
                name="name" 
                className="form-input"
                placeholder="Введите ваше имя"
              />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <Field 
                type="email" 
                name="email" 
                className="form-input"
                placeholder="Введите ваш email"
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label htmlFor="message">Ваш отзыв:</label>
              <Field 
                as="textarea" 
                name="message" 
                className="form-textarea"
                placeholder="Напишите ваш отзыв здесь..."
                rows={5}
              />
              <ErrorMessage name="message" component="div" className="error-message" />
            </div>

            <div className="button-group">
              <button 
                type="button"  // Важно! Добавляем type="button"
                onClick={handleBack} 
                className="action-button secondary"
              >
                Назад
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="action-button"
              >
                {isSubmitting ? 'Отправка...' : 'Добавить отзыв'}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="feedback-history">
        <h2>История отзывов:</h2>
        {feedbackList.length === 0 ? (
          <p>Нет отзывов.</p>
        ) : (
          <ul>
            {feedbackList.map((feedback, index) => (
              <li key={index}>
                <strong>{feedback.name}:</strong> {feedback.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
};

const FeedbackForm: React.FC = () => {
  return (
    <Suspense fallback={<div className="feedback-container">Загрузка...</div>}>
      <FeedbackContent />
    </Suspense>
  );
};

export default FeedbackForm;