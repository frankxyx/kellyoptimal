// src/QuizCard.jsx
import { useState, useEffect, useMemo} from 'react';
import { getQuestion } from './api';
import './QuizCard.css';
import PriceYieldChart from './PriceYieldChart';
import { makeCurve, kellyAllocation, bondPrice} from './bondUtils';

export default function QuizCard() {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [shockBp,  setShockBp] = useState(25); // 25Bp shock by default
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
  
  // convert shockBp to decimal yield change
  const shock = shockBp / 10000; 

  // compute shifted yields
  const goodYield = question.rate - shock;
  const badYield  = question.rate + shock;

  // look up prices from the curve
  const priceUp   = bondPrice(question.face, question.coupon, question.years, goodYield);
  const priceDown = bondPrice(question.face, question.coupon, question.years, badYield);

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

        {/* shock‐size slider */}
      <div className="shock-container">
        <label htmlFor="shock">
          Yield shock size: <strong>{shockBp} bp</strong>
        </label>
        <input
          id="shock"
          type="range"
          min="1"
          max="100"
          step="1"
          value={shockBp}
          onChange={e => setShockBp(+e.target.value)}
        />
      </div>

    {/* confidence slider */}
      <div className="confidence-container">
        <label htmlFor="confidence">
          Confidence that yield will fall by {shockBp} bp:
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

