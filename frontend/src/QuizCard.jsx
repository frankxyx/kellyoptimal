// src/QuizCard.jsx
import { useState, useEffect } from 'react';
import { getQuestion } from './api';
import './QuizCard.css';

export default function QuizCard() {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadQuestion();
  }, []);

  function loadQuestion() {
    setFeedback('');
    getQuestion()
      .then(q => setQuestion(q))
      .catch(err => {
        console.error(err);
        setQuestion({ error: true });
      });
  }

  if (!question) {
    return <p>Loading question…</p>;
  }
  if (question.error) {
    return (
      <div>
        <p>Unable to load question.</p>
        <button onClick={loadQuestion}>Retry</button>
      </div>
    );
  }

  return (
    <div className="quiz-card">
      <p>
        Original Bond: <strong>{question.years}-year</strong>,{' '}
        <strong>£{question.face}</strong> face,{' '}
        <strong>{(question.coupon * 100).toFixed(1)}%</strong> coupon.
        <br />
        If market rate is{' '}
        <strong>{(question.rate * 100).toFixed(1)}%</strong>, what’s its
        current value?
      </p>

      <div className="options-container">
        {question.options.map((val, i) => {
          const label = String.fromCharCode(65 + i);
          const display = Math.round(val);
          return (
            <button
              key={i}
              className="option-button"
              onClick={() => {
                setFeedback(
                  val === question.correct
                    ? '✅ Correct!'
                    : `❌ Nope—correct is £${Math.round(question.correct)}`
                );
              }}
            >
              {label}. £{display}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="feedback-container">
          <p className="feedback-text">{feedback}</p>
          <button className="next-button" onClick={loadQuestion}>
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}

