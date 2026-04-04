import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Helmet } from 'react-helmet-async';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', company: '', password: '', password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const { authApi } = await import('../../services/api');
      await authApi.register(form);
      const user = await login(form.username, form.password);
      navigate(user.role === 'owner' ? '/owner' : '/member', { replace: true });
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Registration failed. Please check your details.'] });
    } finally {
      setLoading(false);
    }
  };

  const fe = k => errors[k]?.[0] || '';

  return (
    <>
      <Helmet>
        <title>Create Account | Nairobi JetHouse - Premium Logistics & Cargo Services</title>
        <meta name="description" content="Create your Nairobi JetHouse account. Join Africa's premier private aviation platform." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://nairobijethouse.com/register" />
      </Helmet>

      <div className="login-container">
        <div className="login-grid">
          <div className="login-form-section">
            <div className="form-wrapper">

              {/* Mobile Logo */}
              <div className="mobile-logo">
                <img src="/nairobi_jet_house_logo.png" alt="Nairobi JetHouse" className="mobile-logo-img" />
              </div>

              <div className="form-header">
                <h2 className="form-title">Create Your Account</h2>
                <p className="form-subtitle">Join Africa's premier private aviation platform</p>
              </div>

              {(errors.non_field_errors || errors.detail) && (
                <div className="alert alert-error" role="alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{errors.non_field_errors?.[0] || errors.detail}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">

                {/* Row: First Name + Last Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-person"></i>
                      First Name
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input${fe('first_name') ? ' input-error' : ''}`}
                      placeholder="Jane"
                      value={form.first_name}
                      onChange={set('first_name')}
                      required
                      autoFocus
                      autoComplete="given-name"
                    />
                    {fe('first_name') && <span className="field-error">{fe('first_name')}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-person"></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Odhiambo"
                      value={form.last_name}
                      onChange={set('last_name')}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* Row: Username + Email */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-at"></i>
                      Username
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input${fe('username') ? ' input-error' : ''}`}
                      placeholder="jane.odhiambo"
                      value={form.username}
                      onChange={set('username')}
                      required
                      autoComplete="username"
                    />
                    {fe('username') && <span className="field-error">{fe('username')}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-envelope"></i>
                      Email Address
                      <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-input${fe('email') ? ' input-error' : ''}`}
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={set('email')}
                      required
                      autoComplete="email"
                    />
                    {fe('email') && <span className="field-error">{fe('email')}</span>}
                  </div>
                </div>

                {/* Row: Phone + Company */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-telephone"></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+254 700 000 000"
                      value={form.phone}
                      onChange={set('phone')}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-building"></i>
                      Company / Organisation
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={set('company')}
                      autoComplete="organization"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock"></i>
                    Password
                    <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input password-input${fe('password') ? ' input-error' : ''}`}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={set('password')}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {fe('password') && <span className="field-error">{fe('password')}</span>}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock-fill"></i>
                    Confirm Password
                    <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      className={`form-input password-input${fe('password2') ? ' input-error' : ''}`}
                      placeholder="Repeat password"
                      value={form.password2}
                      onChange={set('password2')}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword2(v => !v)}
                      aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPassword2 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {fe('password2') && <span className="field-error">{fe('password2')}</span>}
                </div>

                {/* Info notice */}
                <div className="info-notice">
                  <i className="bi bi-info-circle"></i>
                  Accounts default to <strong>Membership Client</strong> role. Contact us to register as a Fleet Owner.
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus"></i>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <div className="divider">
                  <span>Already have an account?</span>
                </div>
                <Link to="/login" className="btn-secondary">
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In Instead
                </Link>
                <div className="alternative-links">
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
            max-width: 640px;
          }

          /* Mobile Logo */
          .mobile-logo {
            display: none;
            text-align: center;
            margin-bottom: 2rem;
          }

          .mobile-logo-img {
            height: 50px;
            width: auto;
          }

          /* Header */
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

          /* Form */
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
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
            box-sizing: border-box;
          }

          .form-input:focus {
            outline: none;
            border-color: var(--gold, #c9a84c);
            box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1);
          }

          .form-input.input-error {
            border-color: #ef4444;
          }

          .field-error {
            font-size: 0.75rem;
            color: #ef4444;
            margin-top: -0.25rem;
          }

          /* Password */
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

          /* Info notice */
          .info-notice {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            background: #fef9e6;
            border: 1px solid rgba(201, 168, 76, 0.3);
            border-radius: 4px;
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
            color: #92680a;
          }

          .info-notice i {
            flex-shrink: 0;
            margin-top: 0.1rem;
          }

          /* Submit button */
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
            margin-top: 0.25rem;
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
            to { transform: rotate(360deg); }
          }

          /* Responsive */
          @media (max-width: 600px) {
            .form-row {
              grid-template-columns: 1fr;
            }

            .mobile-logo {
              display: block;
            }

            .login-form-section {
              padding: 1.5rem;
              align-items: flex-start;
              padding-top: 2rem;
            }

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