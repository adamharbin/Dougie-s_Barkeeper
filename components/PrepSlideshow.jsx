"use client";

import { useEffect, useState } from "react";

export default function PrepSlideshow({ steps, onClose }) {
  const [index, setIndex] = useState(0);
  const total = steps.length;
  const step = steps[index];

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, total - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [total, onClose]);

  if (!step) return null;

  return (
    <div className="bk-slideshow-overlay">
      <button className="bk-slideshow-close" onClick={onClose} aria-label="Close slideshow">✕</button>

      <div className="bk-slideshow-body">
        <div className="bk-slideshow-image-wrap">
          {step.image_url ? (
            <img src={step.image_url} alt="" className="bk-slideshow-image" />
          ) : (
            <div className="bk-slideshow-image-empty">No photo for this step</div>
          )}
        </div>

        <div className="bk-slideshow-info">
          <span className="bk-step-badge bk-slideshow-badge">Step {index + 1}</span>
          {step.title && <h3 className="bk-slideshow-title">{step.title}</h3>}
          <p className="bk-slideshow-instructions">{step.instructions}</p>
        </div>
      </div>

      <div className="bk-slideshow-controls">
        <button
          className="bk-slideshow-chevron"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          aria-label="Previous step"
        >
          ‹
        </button>
        <span className="bk-slideshow-counter">{index + 1} / {total}</span>
        <button
          className="bk-slideshow-chevron"
          onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
          disabled={index === total - 1}
          aria-label="Next step"
        >
          ›
        </button>
      </div>
    </div>
  );
}
