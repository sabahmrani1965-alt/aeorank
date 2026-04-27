const MODELS = {
  gpt: { label: "ChatGPT-style answer", letter: "G" },
  claude: { label: "Claude-style answer", letter: "✦" },
  gemini: { label: "Gemini-style answer", letter: "✱" },
};

export default function LlmMock({ model = "gpt", question, children, badge }) {
  const m = MODELS[model] || MODELS.gpt;
  return (
    <div className="llm-mock">
      {badge && <div className="disclaimer-pill">{badge}</div>}
      <div className="llm-mock-header">
        <span className={`llm-logo ${model}`}>{m.letter}</span>
        {m.label}
      </div>
      <div className="llm-mock-q">{question}</div>
      <div className="llm-mock-a">{children}</div>
    </div>
  );
}
