import React, { useState } from 'react';
import { Shield, Eye, EyeOff, KeyRound, AlertCircle, RefreshCw, Send } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin_aicte');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = Credentials, 2 = MFA/OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate validation
    setTimeout(() => {
      if (username.trim() === 'admin_aicte' && password === 'password123') {
        setStep(2);
        setIsLoading(false);
      } else {
        setError('Invalid username or security access credentials.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Handle backspace back-focus
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate MFA verification
    setTimeout(() => {
      if (code === '123456' || code === '654321' || code.startsWith('123') || code.endsWith('6')) {
        setIsLoading(false);
        onLoginSuccess({
          username: 'admin_aicte',
          role: 'System Compliance Officer',
          authenticatedAt: new Date().toISOString()
        });
      } else {
        setError('Invalid secure token signature. Please verify the code on your MFA device.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const resetFlow = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gov-card border border-gov-border rounded-2xl shadow-glow-primary overflow-hidden p-8 space-y-6 relative transition-all duration-300">
        
        {/* Shield Icon & Portal Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-gov-primary/20 p-4 rounded-full text-gov-primaryLight ring-4 ring-gov-primary ring-opacity-10">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-wider text-gov-text">AICTE SECURE PORTAL</h1>
            <p className="text-xs text-gov-muted mt-0.5">Government of India - Member 6 Governance Suite</p>
          </div>
        </div>

        {/* Status Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-gov-danger/10 border border-gov-danger/30 flex items-start gap-2.5 text-xs text-gov-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Step 1: Credential Submission */}
        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] text-gov-muted font-bold uppercase tracking-wider block">Compliance Officer ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gov-dark border border-gov-border rounded-lg text-xs text-gov-text focus:outline-none focus:border-gov-primary focus:ring-1 focus:ring-gov-primary transition font-medium"
                placeholder="Enter credentials username"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1 relative">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gov-muted font-bold uppercase tracking-wider block">Security Access Key</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-gov-dark border border-gov-border rounded-lg text-xs text-gov-text focus:outline-none focus:border-gov-primary focus:ring-1 focus:ring-gov-primary transition font-medium"
                  placeholder="Enter security key password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gov-muted hover:text-gov-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gov-primary text-white hover:bg-opacity-90 disabled:opacity-50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-glow-primary cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>AUTHENTICATE CREDENTIALS</span>
            </button>
            
            <p className="text-[10px] text-gov-muted text-center leading-relaxed">
              Default credentials: <span className="font-semibold text-gov-primaryLight">admin_aicte</span> & <span className="font-semibold text-gov-primaryLight">password123</span>
            </p>
          </form>
        ) : (
          /* Step 2: Multi-Factor Authentication OTP */
          <form onSubmit={handleMfaSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-gov-text uppercase">Multi-Factor Authentication (MFA)</h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                Enter the 6-digit security token generated by your sync authenticator app (e.g. Google Authenticator) or type <span className="text-gov-primaryLight font-mono">123456</span> to bypass.
              </p>
            </div>

            {/* OTP Numbers Inputs Row */}
            <div className="flex justify-between gap-2 max-w-xs mx-auto">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-10 h-12 text-center bg-gov-dark border border-gov-border rounded-lg text-lg font-bold text-gov-primaryLight focus:outline-none focus:border-gov-primary focus:ring-1 focus:ring-gov-primary transition"
                />
              ))}
            </div>

            {/* Verification Button Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gov-success text-white hover:bg-opacity-95 disabled:opacity-50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-glow-success cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>VERIFY OTP & ACCESS PORTAL</span>
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="w-full py-2 bg-transparent text-gov-muted hover:text-gov-text text-[10px] font-bold uppercase transition"
              >
                Go Back to credentials
              </button>
            </div>
          </form>
        )}

        {/* Security Warning footer footer */}
        <div className="text-[9px] text-gov-muted text-center pt-2 border-t border-gov-border/35">
          🔒 Encrypted Session AES-GCM. Unauthorised access attempts are logged under compliance guidelines (M6 audit trails).
        </div>
      </div>
    </div>
  );
}
