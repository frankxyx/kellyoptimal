// src/QuizCard.jsx
import { useState, useEffect, useMemo} from 'react';
import { getQuestion } from './api';
import './QuizCard.css';
import PriceYieldChart from './PriceYieldChart';
import { makeCurve, kellyAllocation } from './bondUtils';

export default function QuizCard() {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [confidence, setConfidence] = useState(0.5); // 50% confidence by default

  const curve = useMemo(() => {
  if (!question) return [];      // question is null → no curve yet
  return makeCurve(
    question.face,
    question.coupon,
    question.years
  );
}, [question]);

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

  // pick the ±1% yields
  const goodYield = question.rate - 0.01;
  const badYield  = question.rate + 0.01;
  const priceUp   = curve.find(({ yield: y }) => y === +(goodYield * 100).toFixed(2))?.price;
  const priceDown = curve.find(({ yield: y }) => y === +(badYield  * 100).toFixed(2))?.price;

  // compute Kelly fraction based on user confidence
  const kelly = (priceUp && priceDown)
    ? Math.max(
        0,
        kellyAllocation({
          currentPrice: question.correct,
          priceUp,
          priceDown,
          p: confidence
        })
      )
    : 0;

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

      <div className="chart-wrapper">
      <PriceYieldChart
         face={question.face}
         coupon={question.coupon}
         years={question.years}
         correctRate={question.rate}
         correctPrice={question.correct}
       />
     </div>      

        {/* CONFIDENCE SLIDER */}
      <div className="confidence-container">
        <label htmlFor="confidence">
          Your confidence that yield will <em>fall</em> by 1%:
          <strong> {(confidence * 100).toFixed(0)}%</strong>
        </label>
        <input
          id="confidence"
          type="range"
          min="0"
          max="100"
          step="1"
          value={confidence * 100}
          onChange={e => setConfidence(e.target.value / 100)}
        />
      </div>

      {/* KELLY ALLOCATION DISPLAY */}
      <div className="kelly-container">
        <p>
          Kelly‐optimal allocation: <strong>{(kelly * 100).toFixed(1)}%</strong>{" "}
          of your capital
        </p>
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

