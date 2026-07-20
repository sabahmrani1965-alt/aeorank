import ScrollReveal from "./ScrollReveal";

const STEPS = [
  { icon: "📝", title: "Create your account", desc: "Sign up with your email and your Reddit username or profile link." },
  { icon: "✅", title: "Get verified", desc: "We confirm your Reddit account is active, at least 6 months old, and has real karma — this keeps missions genuine, not bot-farmed." },
  { icon: "🎯", title: "Accept missions", desc: "Pick a mission from the marketplace, write it in your own voice, and post it from your own account." },
  { icon: "💰", title: "Get paid", desc: "Submit the link, it's logged to your earnings, and you withdraw once you've hit $10." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <ScrollReveal>
          <span className="section-tag">( how it works )</span>
          <h2>From sign-up to paid, in four steps</h2>
        </ScrollReveal>

        <div className="cq-timeline">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 100}>
              <div className="cq-timeline-step">
                <div className="cq-timeline-icon">{step.icon}</div>
                <div className="cq-timeline-body">
                  <div className="cq-timeline-title">{step.title}</div>
                  <div className="cq-timeline-desc">{step.desc}</div>
                </div>
                {i < STEPS.length - 1 && <div className="cq-timeline-connector" />}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
