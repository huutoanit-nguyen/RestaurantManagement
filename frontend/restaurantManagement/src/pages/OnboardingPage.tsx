import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, Glyph, Dashboard } from './LandingPage';
import { authApi, session } from '../api/auth';
import '../marketing.css';

const restaurantPhoto = `${import.meta.env.BASE_URL}images/restaurant.jpg`;

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!session.token;

  const [step, setStep] = useState(0);
  const [restaurant, setRestaurant] = useState('');
  const [type, setType] = useState('Restaurant');
  const [size, setSize] = useState('1–5 people');
  const [goals, setGoals] = useState<string[]>(['Bring orders together']);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Staff join modal / toggle
  const [showStaffJoin, setShowStaffJoin] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [staffNotice, setStaffNotice] = useState('');

  const steps = ['Your restaurant', 'Your priorities', 'Ready to grow'];

  const goHome = () => {
    navigate('/');
  };

  const handleCreateRestaurant = async () => {
    const trimmed = restaurant.trim();
    if (!trimmed) {
      setError('A restaurant needs a name. What’s yours?');
      return;
    }

    if (isLoggedIn) {
      setLoading(true);
      setError('');
      try {
        const res = await authApi.createRestaurant(trimmed);
        session.save({
          token: res.token,
          restaurantId: res.restaurantId,
          role: res.role || 'Restaurant Owner',
          name: res.name || trimmed,
          fullName: res.fullName || session.fullName,
        });
        setComplete(true);
      } catch (err: any) {
        if (err.status === 409) {
          setError('You have already registered this restaurant.');
        } else {
          setError(err.message || 'Unable to create restaurant. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Guest mode - preview
      setComplete(true);
    }
  };

  const goNext = (event: FormEvent) => {
    event.preventDefault();
    if (step === 0 && !restaurant.trim()) {
      setError('A restaurant needs a name. What’s yours?');
      return;
    }
    if (step === 1 && goals.length === 0) {
      setError('Choose at least one priority to get started.');
      return;
    }
    setError('');

    if (step < 2) {
      setStep(step + 1);
    } else {
      handleCreateRestaurant();
    }
  };

  const handleStaffJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPhone.trim()) {
      setStaffNotice("Please enter the restaurant owner's phone number.");
      return;
    }
    setStaffNotice(
      `Your request has been sent to the owner (${ownerPhone.trim()}). Management will review your account shortly!`
    );
  };

  if (complete) {
    return (
      <div className="rm-site onboarding-success">
        <header className="success-header">
          <button onClick={goHome} aria-label="Return home" style={{ background: 'transparent', border: 0 }}>
            <Logo />
          </button>
          <span className="preview-pill">
            {isLoggedIn ? 'WORKSPACE READY' : 'INTERACTIVE PREVIEW'}
          </span>
        </header>

        <div className="success-intro">
          <span className="success-check">
            <Glyph name="check" size={27} />
          </span>
          <div className="rm-eyebrow">HERE’S TO YOUR NEXT CHAPTER</div>
          <h1>Looking good, {restaurant}.</h1>
          <p>
            {isLoggedIn
              ? 'Your restaurant is ready to go. Configure tables, craft menus, and take your first orders!'
              : 'This is a taste of your new everyday. Less juggling. More possibility.'}
          </p>
          <span className="preview-disclaimer">
            {isLoggedIn
              ? `Workspace connected to account: ${session.fullName || 'You'}`
              : 'Demo workspace preview. You can create an account anytime to save your restaurant.'}
          </span>
        </div>

        <div className="success-dashboard">
          <Dashboard restaurant={restaurant} />
        </div>

        <div className="success-bottom">
          <button
            className="rm-button outline"
            onClick={() => {
              setComplete(false);
              setStep(0);
            }}
          >
            Edit your setup
          </button>

          {isLoggedIn ? (
            <button className="rm-button" onClick={() => navigate('/app')}>
              Go to Workspace <Glyph size={17} />
            </button>
          ) : (
            <button
              className="rm-button"
              onClick={() =>
                navigate(`/register?restaurant=${encodeURIComponent(restaurant)}`)
              }
            >
              Sign up to save workspace <Glyph size={17} />
            </button>
          )}

          <button className="rm-button outline" onClick={goHome}>
            Back to ResMana <Glyph size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rm-site rm-onboarding">
      {/* Left Aside */}
      <aside className="onboard-aside">
        <button
          className="onboard-logo"
          onClick={goHome}
          aria-label="Return to ResMana home"
          style={{ background: 'transparent', border: 0 }}
        >
          <Logo />
        </button>

        <div className="onboard-aside-copy">
          <span className="rm-eyebrow">A FRESH START, TOGETHER.</span>
          <h2>
            A little less
            <br />
            managing.
            <br />
            <span>
              A lot more
              <br />
              possibility.
            </span>
          </h2>
          <p>
            Let’s make space for the things that made you fall in love with
            hospitality.
          </p>
          <div className="onboard-mini-photo">
            <img
              src={restaurantPhoto}
              alt="Guests enjoying a sunny, welcoming restaurant"
            />
            <span>
              <Glyph name="leaf" size={18} />
              Made for your kind of busy.
            </span>
          </div>
        </div>

        <div className="onboard-aside-bottom">
          <span className="announcement-dot" />
          Hospitality at heart. Simplicity in mind.
        </div>
      </aside>

      {/* Right Main */}
      <main className="onboard-main">
        <div className="onboard-top">
          <button onClick={goHome} style={{ background: 'transparent', border: 0 }}>
            <span>←</span> Back to home
          </button>
          <span>Just a few little things.</span>
        </div>

        <div className="onboard-form-wrap">
          {/* Progress Indicator */}
          <div className="onboard-steps" aria-label="Setup progress">
            {steps.map((label, i) => (
              <div key={label} className={i <= step ? 'current' : ''}>
                <span>
                  {i < step ? <Glyph name="check" size={13} /> : `0${i + 1}`}
                </span>
                <small>{label}</small>
              </div>
            ))}
          </div>

          <div className="rm-eyebrow">STEP 0{step + 1} OF 03</div>
          <h1>
            {
              [
                'First, let’s meet your restaurant.',
                'What’s on your plate?',
                'A fresh start looks good on you.',
              ][step]
            }
          </h1>
          <p className="onboard-description">
            {
              [
                'Every great service starts somewhere. Tell us a little about your place.',
                'Choose what you’d like a helping hand with. We’ll shape the experience around you.',
                'Here’s what we’ve put together. Take a look before exploring your restaurant workspace.',
              ][step]
            }
          </p>

          <form onSubmit={goNext}>
            {/* Step 1: Restaurant Details */}
            {step === 0 && (
              <div className="onboard-fields">
                <label htmlFor="restaurant-name">
                  Your restaurant’s name <span>*</span>
                </label>
                <input
                  autoFocus
                  id="restaurant-name"
                  name="restaurant"
                  value={restaurant}
                  onChange={(e) => {
                    setRestaurant(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. The Green Table"
                  maxLength={60}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'onboard-error' : undefined}
                />

                <label htmlFor="restaurant-type">
                  What kind of place do you run?
                </label>
                <div className="select-wrap">
                  <select
                    id="restaurant-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {[
                      'Restaurant',
                      'Café & coffee shop',
                      'Bakery',
                      'Bar & pub',
                      'Food truck',
                      'Something else',
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <Glyph name="chevron" size={16} />
                </div>

                <label htmlFor="team-size">How big is your team?</label>
                <div className="select-wrap">
                  <select
                    id="team-size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    {[
                      'Just me',
                      '1–5 people',
                      '6–15 people',
                      '16–30 people',
                      '31+ people',
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <Glyph name="chevron" size={16} />
                </div>

                <div className="onboard-tip">
                  <Glyph name="leaf" size={18} />
                  <p>
                    Big ambitions, small beginnings, or somewhere in between.
                    <br />
                    You’re in the right place.
                  </p>
                </div>

                {/* Staff Join Option */}
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e5ecd9' }}>
                  <button
                    type="button"
                    onClick={() => setShowStaffJoin(!showStaffJoin)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#52735b',
                      fontSize: '11px',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{showStaffJoin ? '−' : '+'}</span>
                    Are you a staff member joining an existing restaurant?
                  </button>

                  {showStaffJoin && (
                    <div style={{ marginTop: '12px', padding: '14px', background: '#f7f9f4', borderRadius: '8px', border: '1px solid #dce5d3' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#4a5b42', marginBottom: '6px' }}>
                        Owner's phone number
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="tel"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder="e.g. 0912345678"
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            border: '1px solid #d0dac6',
                            borderRadius: '6px',
                            fontSize: '11px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleStaffJoin}
                          className="rm-button small"
                          style={{ padding: '8px 14px' }}
                        >
                          Send request
                        </button>
                      </div>
                      {staffNotice && (
                        <p style={{ marginTop: '8px', fontSize: '10px', color: '#52735b', lineHeight: 1.5 }}>
                          {staffNotice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Priorities */}
            {step === 1 && (
              <fieldset className="goal-options">
                <legend className="sr-only">
                  Choose your restaurant priorities
                </legend>
                {[
                  {
                    name: 'Bring orders together',
                    description: 'A smoother flow from table to kitchen.',
                    icon: 'order',
                  },
                  {
                    name: 'Take care of my team',
                    description: 'Clearer shifts. A happier team.',
                    icon: 'team',
                  },
                  {
                    name: 'Understand my business',
                    description: 'A fresh perspective on your numbers.',
                    icon: 'chart',
                  },
                  {
                    name: 'Simplify the everyday',
                    description: 'Less juggling. More breathing room.',
                    icon: 'grid',
                  },
                ].map((goal) => (
                  <label
                    className={goals.includes(goal.name) ? 'chosen' : ''}
                    key={goal.name}
                  >
                    <Glyph name={goal.icon} size={23} />
                    <span>
                      <strong>{goal.name}</strong>
                      <small>{goal.description}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={goals.includes(goal.name)}
                      onChange={() => {
                        setGoals(
                          goals.includes(goal.name)
                            ? goals.filter((g) => g !== goal.name)
                            : [...goals, goal.name]
                        );
                        setError('');
                      }}
                    />
                  </label>
                ))}
              </fieldset>
            )}

            {/* Step 3: Summary */}
            {step === 2 && (
              <div className="onboard-summary">
                <div className="summary-restaurant">
                  <span>{restaurant.trim()[0]?.toUpperCase() || 'R'}</span>
                  <div>
                    <h3>{restaurant}</h3>
                    <p>
                      {type} <span>·</span> {size}
                    </p>
                  </div>
                  <button type="button" onClick={() => setStep(0)}>
                    Edit
                  </button>
                </div>
                <div className="summary-goals">
                  <div>
                    <span className="rm-eyebrow">A LITTLE MORE FOCUS ON</span>
                    <button type="button" onClick={() => setStep(1)}>
                      Edit
                    </button>
                  </div>
                  {goals.map((goal) => (
                    <p key={goal}>
                      <Glyph name="check" size={16} />
                      {goal}
                    </p>
                  ))}
                </div>
                <div className="summary-note">
                  <Glyph name="leaf" size={21} />
                  <p>
                    {isLoggedIn
                      ? 'Click continue to create and launch your restaurant workspace on ResMana.'
                      : 'Your next chapter starts with a look around. You can explore a live preview or sign up anytime.'}
                  </p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <p className="onboard-error" id="onboard-error" role="alert">
                {error}
              </p>
            )}

            {/* Form actions */}
            <div className="onboard-form-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="rm-text-button"
                  onClick={() => {
                    setStep(step - 1);
                    setError('');
                  }}
                  style={{ background: 'transparent', border: 0 }}
                >
                  ← Back
                </button>
              )}
              <button type="submit" className="rm-button" disabled={loading}>
                {loading
                  ? 'Creating your restaurant...'
                  : step === 2
                    ? isLoggedIn
                      ? 'Launch restaurant workspace'
                      : 'Explore my sample workspace'
                    : 'Continue'}
                <Glyph size={17} />
              </button>
            </div>

            <p className="onboard-fine-print">
              <Glyph name="check" size={12} />
              {isLoggedIn
                ? 'Signed in • Full workspace unlocked'
                : 'No credit card needed. Just a little exploring.'}
            </p>
          </form>
        </div>

        <div className="onboard-bottom">
          <span>© {new Date().getFullYear()} ResMana</span>
          <span>Your restaurant. Your rhythm.</span>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
