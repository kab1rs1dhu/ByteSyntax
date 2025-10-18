import "../styles/auth.css";
import { SignInButton } from "@clerk/clerk-react";
import ThreeBackground from "../components/ThreeBackground";

const AuthPage = () => {
  return (
    <div className="auth-page">
      <ThreeBackground className="threejs-background" />
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-hero">
            <div className="brand-container">
              <div className="brand-logo" />
              <span className="brand-name">Byte Syntax</span>
            </div>

            <h1 className="hero-title">Build Momentum Together ⚡</h1>

            <p className="hero-subtitle">
              Connect with your team instantly through secure, real-time messaging. Experience
              seamless collaboration with powerful features designed for modern teams.
            </p>

            {/* TIP: You can also pass appearance variables if you want */}
            <SignInButton mode="modal">
              <button className="cta-button" type="button">
                Get Started with Byte Syntax <span className="button-arrow">→</span>
              </button>
            </SignInButton>
          </div>
        </div>

        <div className="auth-right">
          <div className="feature-panel">
            <h2 className="feature-panel__title">Built for focused collaboration</h2>
            <p className="feature-panel__subtitle">
              Everything your team needs to stay aligned, move fast, and keep conversations organized.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <span className="feature-card__icon">💬</span>
                <div>
                  <h3 className="feature-card__title">Threaded Messaging</h3>
                  <p className="feature-card__copy">
                    Keep discussions tidy with threads, mentions, and rich reactions.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <span className="feature-card__icon">🎥</span>
                <div>
                  <h3 className="feature-card__title">Crystal-Clear Calls</h3>
                  <p className="feature-card__copy">
                    Hop into video or audio rooms without leaving the channel.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <span className="feature-card__icon">📌</span>
                <div>
                  <h3 className="feature-card__title">Actionable Spaces</h3>
                  <p className="feature-card__copy">
                    Pin decisions, assign tasks, and surface what matters faster.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <span className="feature-card__icon">🔒</span>
                <div>
                  <h3 className="feature-card__title">Enterprise Security</h3>
                  <p className="feature-card__copy">
                    SOC2 ready with SSO, secure history, and advanced permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="feature-panel__footer">
              <span className="status-pill">Live presence</span>
              <p>See teammates typing, reacting, and joining calls in real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
