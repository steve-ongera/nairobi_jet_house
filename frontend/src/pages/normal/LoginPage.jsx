import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { Helmet } from 'react-helmet-async';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roleRedirect = (role) => {
    if (from && !from.startsWith('/login') && !from.startsWith('/register')) return from;
    const map = { admin: '/admin', staff: '/staff', client: '/member', owner: '/owner' };
    return map[role] || '/';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.username, form.password);
      navigate(roleRedirect(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Nairobi JetHouse - Premium Logistics & Cargo Services</title>
        <meta name="description" content="Sign in to your Nairobi JetHouse account. Manage your shipments, track cargo in real-time, access premium logistics services, and get exclusive member benefits." />
        <meta name="keywords" content="Nairobi JetHouse login, cargo tracking, logistics portal, shipment management, Kenya logistics" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://nairobijethouse.com/login" />
      </Helmet>

      <div className="login-container">
        <div className="login-grid">
          {/* Centered Form Section */}
          <div className="login-form-section">
            <div className="form-wrapper">
              {/* Mobile Logo (visible only on small screens) */}
              <div className="mobile-logo">
                <img
                  src="/nairobi_jet_house_logo.png"
                  alt="Nairobi JetHouse"
                  className="mobile-logo-img"
                />
              </div>

              <div className="form-header">
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-subtitle">
                  Sign in to access your dashboard and manage your logistics
                </p>
              </div>

              {error && (
                <div className="alert alert-error" role="alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    <i className="bi bi-person"></i>
                    Username or Email
                    <span className="required">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="form-input"
                    placeholder="e.g., john.doe or john@example.com"
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock"></i>
                    Password
                    <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input password-input"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <div className="form-options">
                    <label className="checkbox-label">
                      <input type="checkbox" /> Remember me
                    </label>
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>Sign In to Your Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <div className="divider">
                  <span>New to Nairobi JetHouse?</span>
                </div>
                <Link to="/register" className="btn-secondary">
                  <i className="bi bi-person-plus"></i>
                  Create New Account
                </Link>
                <div className="alternative-links">
                  <Link to="/track" className="alt-link">
                    <i className="bi bi-search"></i>
                    Track Shipment Without Login
                  </Link>
                  <Link to="/" className="alt-link">
                    <i className="bi bi-house"></i>
                    Back to Homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          /* Container */
          .login-container {
            min-height: 100vh;
           
          }

          .login-grid {
            display: grid;
            grid-template-columns: 1fr;
            min-height: 100vh;
            max-width: 1400px;
            margin: 0 auto;
          }

          /* Form Section */
          .login-form-section {
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .form-wrapper {
            width: 100%;
            max-width: 450px;
          }

          .mobile-logo {
            display: none;
            text-align: center;
            margin-bottom: 2rem;
          }

          .mobile-logo-img {
            height: 50px;
            width: auto;
          }

          .form-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .form-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a2a3a;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.5px;
          }

          .form-subtitle {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0;
          }

          /* Form Elements */
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .form-label i {
            color: var(--gold, #c9a84c);
            font-size: 0.875rem;
          }

          .required {
            color: #ef4444;
            margin-left: 0.25rem;
          }

          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            border: 1px solid #e5e7eb;
            background: white;
            transition: all 0.2s ease;
          }

          .form-input:focus {
            outline: none;
            border-color: var(--gold, #c9a84c);
            box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1);
          }

          .password-wrapper {
            position: relative;
          }

          .password-input {
            padding-right: 2.5rem;
          }

          .password-toggle {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0;
          }

          .password-toggle:hover {
            color: #6b7280;
          }

          .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
            cursor: pointer;
          }

          .checkbox-label input {
            cursor: pointer;
          }

          .forgot-link {
            font-size: 0.875rem;
            color: var(--gold, #c9a84c);
            text-decoration: none;
          }

          .forgot-link:hover {
            text-decoration: underline;
          }

          /* Buttons */
          .btn-submit {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.875rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
            background: #1a2a3a;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 0.5rem;
          }

          .btn-submit:hover:not(:disabled) {
            background: #0f1a24;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.75rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #1a2a3a;
            background: white;
            border: 1px solid #e5e7eb;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .btn-secondary:hover {
            border-color: var(--gold, #c9a84c);
            background: #fef9e6;
          }

          /* Footer */
          .form-footer {
            margin-top: 2rem;
          }

          .divider {
            position: relative;
            text-align: center;
            margin: 1.5rem 0;
          }

          .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e5e7eb;
          }

          .divider span {
            position: relative;
            background: white;
            padding: 0 1rem;
            font-size: 0.75rem;
            color: #9ca3af;
          }

          .alternative-links {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 1.5rem;
          }

          .alt-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: #6b7280;
            text-decoration: none;
          }

          .alt-link:hover {
            color: var(--gold, #c9a84c);
          }

          /* Alert */
          .alert {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            border-left: 3px solid;
          }

          .alert-error {
            background: #fef2f2;
            border-left-color: #ef4444;
            color: #991b1b;
          }

          /* Spinner */
          .spinner-border {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner 0.75s linear infinite;
          }

          @keyframes spinner {
            to {
              transform: rotate(360deg);
            }
          }

          /* Responsive */
          @media (max-width: 968px) {
            .login-grid {
              grid-template-columns: 1fr;
            }

            .mobile-logo {
              display: block;
            }

            .login-form-section {
              padding: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .form-title {
              font-size: 1.5rem;
            }

            .alternative-links {
              flex-direction: column;
              align-items: center;
              gap: 0.75rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}