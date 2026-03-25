import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { InterestSelector } from "./InterestSelector";
import { PhoneNumberStep } from "./registration/PhoneNumberStep";
import { PrimaryCurrencyStep } from "./registration/PrimaryCurrencyStep";
import { PINSetupStep } from "./registration/PINSetupStep";
import { ConfirmationStep } from "./registration/ConfirmationStep";
import { phoneDetectionService } from "../utils/phoneDetection";
import { pinService } from "../utils/pinSecurity";
import { getCurrencyForCountry } from "../utils/currencyConfig";
import type { PhoneDetectionResult } from "../utils/phoneDetection";

interface FormData {
  email: string;
  password: string;
  name: string;
  username: string;
  phoneNumber: string;
  detectedCountry: string;
  phoneCountryCode: string;
  primaryCurrency: string;
  pin: string;
  confirmPin: string;
  interests: string[];
}

export function AuthForm() {
  const { signIn } = useAuthActions();
  const sendEmail = useMutation(api.emails.sendEmail);
  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdateProfile);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data state with enhanced fields
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    username: "",
    phoneNumber: "",
    detectedCountry: "",
    phoneCountryCode: "",
    primaryCurrency: "USD", // Default
    pin: "",
    confirmPin: "",
    interests: []
  });
  
  // Validation states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [stepValidation, setStepValidation] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false
  });

  // Check username availability
  const usernameCheck = useQuery(
    api.profiles.checkUsernameAvailability,
    formData.username.length >= 3 ? { username: formData.username } : "skip"
  );

  // Update form data
  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle phone country detection
  const handleCountryDetected = (result: PhoneDetectionResult) => {
    if (result.isValid) {
      setFormData(prev => ({
        ...prev,
        detectedCountry: result.country,
        phoneCountryCode: result.countryCode,
        primaryCurrency: result.currency // Auto-suggest currency
      }));
    }
  };

  // Step validation functions with real-time updates
  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(formData.email) && 
                   formData.password.length >= 6 && 
                   formData.name.trim().length > 0;
    setStepValidation(prev => ({ ...prev, step1: isValid }));
    return isValid;
  };

  const validateStep2 = () => {
    const isUsernameValid = validateUsername(formData.username);
    const isValid = isUsernameValid;
    setStepValidation(prev => ({ ...prev, step2: isValid }));
    return isValid;
  };

  const validateStep3 = () => {
    const phoneValidation = phoneDetectionService.validatePhoneNumber(formData.phoneNumber);
    const isValid = phoneValidation.isValid;
    setStepValidation(prev => ({ ...prev, step3: isValid }));
    return isValid;
  };

  const validateStep4 = () => {
    const isValid = !!formData.primaryCurrency;
    setStepValidation(prev => ({ ...prev, step4: isValid }));
    return isValid;
  };

  const validateStep5 = () => {
    const pinValidation = pinService.validatePINFormat(formData.pin);
    const isValid = pinValidation.isValid && formData.pin === formData.confirmPin;
    setStepValidation(prev => ({ ...prev, step5: isValid }));
    return isValid;
  };

  const validateStep6 = () => {
    // Interests step is always valid (optional)
    return true;
  };

  // Real-time validation effects
  useEffect(() => {
    if (currentStep === 1) {
      validateStep1();
    } else if (currentStep === 2) {
      validateStep2();
    } else if (currentStep === 3) {
      validateStep3();
    } else if (currentStep === 4) {
      validateStep4();
    } else if (currentStep === 5) {
      validateStep5();
    } else if (currentStep === 6) {
      validateStep6();
    }
  }, [formData, currentStep, usernameCheck]);

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    if (usernameCheck && !usernameCheck.available) {
      setUsernameError("Username is already taken");
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    updateFormData("username", value);
    if (value.length >= 3) {
      validateUsername(value);
    } else {
      setUsernameError(null);
    }
  };

  // Step navigation with keyboard support
  const nextStep = () => {
    let canProceed = false;
    
    if (currentStep === 1) {
      canProceed = validateStep1();
      if (!canProceed) {
        setError("Please fill in all required fields correctly");
        return;
      }
    } else if (currentStep === 2) {
      canProceed = validateStep2();
      if (!canProceed) {
        setError("Please complete your profile information");
        return;
      }
    } else if (currentStep === 3) {
      canProceed = validateStep3();
      if (!canProceed) {
        setError("Please enter a valid phone number");
        return;
      }
    } else if (currentStep === 4) {
      canProceed = validateStep4();
      if (!canProceed) {
        setError("Please select a primary currency");
        return;
      }
    } else if (currentStep === 5) {
      canProceed = validateStep5();
      if (!canProceed) {
        setError("Please create a valid PIN");
        return;
      }
    }
    
    if (canProceed && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flow === "signUp") {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (currentStep < 6) {
          nextStep();
        }
      } else if (e.key === "Escape" && currentStep > 1) {
        prevStep();
      }
    }
  };

  // Reset form when switching flows
  const handleFlowChange = (newFlow: "signIn" | "signUp") => {
    setFlow(newFlow);
    setCurrentStep(1);
    setError(null);
    setFormData({
      email: "",
      password: "",
      name: "",
      username: "",
      phoneNumber: "",
      detectedCountry: "",
      phoneCountryCode: "",
      primaryCurrency: "USD",
      pin: "",
      confirmPin: "",
      interests: []
    });
    setUsernameError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (flow === "signIn") {
      // Handle sign in (unchanged)
      const formElement = e.target as HTMLFormElement;
      const formDataElement = new FormData(formElement);
      formDataElement.set("flow", flow);

      try {
        await signIn("password", formDataElement);
      } catch (authErr: any) {
        setError(authErr.message);
      }
      return;
    }

    // Handle enhanced sign up
    await handleEnhancedSignUp();
  };

  const handleEnhancedSignUp = async () => {
    // Validate all steps
    if (!validateStep1() || !validateStep2() || !validateStep3() || 
        !validateStep4() || !validateStep5()) {
      setError("Please complete all required information");
      return;
    }

    // Final validation for username
    if (!validateUsername(formData.username)) {
      return;
    }

    // Validate phone number
    const phoneValidation = phoneDetectionService.validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      setError("Please enter a valid phone number");
      return;
    }

    // Validate PIN
    const pinValidation = pinService.validatePINFormat(formData.pin);
    if (!pinValidation.isValid) {
      setError("Please create a valid PIN");
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match");
      return;
    }

    setIsCreatingAccount(true);
    setError(null);

    try {
      // Hash the PIN before sending to backend
      const hashedPIN = await pinService.hashPIN(formData.pin);

      // Create FormData for sign in
      const signInFormData = new FormData();
      signInFormData.set("email", formData.email);
      signInFormData.set("password", formData.password);
      signInFormData.set("name", formData.name);
      signInFormData.set("phoneNumber", formData.phoneNumber);
      signInFormData.set("flow", flow);

      // Sign in first
      await signIn("password", signInFormData);

      // Create enhanced profile with all new fields
      await createOrUpdateProfile({
        username: formData.username,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        phoneCountryCode: formData.phoneCountryCode,
        detectedCountry: formData.detectedCountry,
        pinHash: hashedPIN,
        primaryCurrency: formData.primaryCurrency,
        interests: formData.interests,
      });

      // Send enhanced welcome email
      await sendEmail({
        to: formData.email,
        subject: "🎉 Welcome to Ambrosia - Your Multi-Currency Wallet is Ready!",
        body: `🎉 **Welcome to Ambrosia!**

Your account has been successfully created with a multi-currency wallet supporting 9 currencies.

---

**Your Account Details:**
- Primary Currency: ${formData.primaryCurrency}
- Detected Country: ${formData.detectedCountry}
- Phone: ${formData.phoneNumber}

**Wallet Features:**
- ✅ Multi-currency deposits (USD, NGN, GBP, EUR, CAD, GHS, KES, GMD, ZAR)
- 🔒 PIN-protected withdrawals (NGN only)
- 💱 Real-time currency conversion
- 📊 Balance tracking in all currencies

---

**Getting Started:**
- Explore free content on the platform
- Deposit funds in any supported currency
- Create your own content and earn from your audience
- Use your PIN for secure withdrawals

---

Thank you for choosing **Ambrosia**. If you have any questions, feel free to reach out.

Warm regards,
**The Ambrosia Team**`.trim(),
      });

    } catch (authErr: any) {
      setError(authErr.message);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold step-indicator-transition ${
                step === currentStep
                  ? "bg-white/40 text-gray-800 border-2 border-white/60 backdrop-blur-sm shadow-sm scale-110"
                  : step < currentStep
                  ? "bg-black text-white border-2 border-black shadow-sm"
                  : "bg-white/20 text-gray-600 border-2 border-white/30 backdrop-blur-sm"
              }`}
            >
              {step}
            </div>
            {step < 6 && (
              <div
                className={`w-6 h-0.5 mx-1 step-indicator-transition ${
                  step < currentStep ? "bg-black" : "bg-white/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Progress Text */}
      <div className="absolute mt-14 text-center">
        <p className="text-xs text-gray-600 font-medium">
          Step {currentStep} of 6
        </p>
      </div>
    </div>
  );

  // Step content renderers with animation
  const renderStep1 = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with your account details</p>
      </div>

      {/* Email Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-envelope glass-input-icon text-lg"></i>
        </div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          required
          placeholder="Email"
          className={`glass-input w-full pl-14 pr-12 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-red-400' : 
            formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-green-400' : ''
          }`}
        />
        {formData.email && (
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center z-10">
            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
              <i className="fas fa-check text-green-600"></i>
            ) : (
              <i className="fas fa-times text-red-600"></i>
            )}
          </div>
        )}
      </div>

      {/* Password Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-lock glass-input-icon text-lg"></i>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
          required
          placeholder="Password"
          className={`glass-input w-full pl-14 pr-20 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            formData.password && formData.password.length < 6 ? 'border-red-400' : 
            formData.password && formData.password.length >= 6 ? 'border-green-400' : ''
          }`}
        />
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center gap-2 z-10">
          {formData.password && (
            formData.password.length >= 6 ? (
              <i className="fas fa-check text-green-600"></i>
            ) : (
              <i className="fas fa-times text-red-600"></i>
            )
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:scale-110 transition-transform"
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} glass-input-icon text-lg`}></i>
          </button>
        </div>
        {formData.password && formData.password.length < 6 && (
          <p className="text-red-700 text-sm mt-2 ml-2 bg-white/90 rounded px-2 py-1 shadow-sm">
            Password must be at least 6 characters
          </p>
        )}
      </div>

      {/* Full Name Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-user glass-input-icon text-lg"></i>
        </div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData("name", e.target.value)}
          required
          placeholder="Full Name"
          className={`glass-input w-full pl-14 pr-12 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            formData.name && formData.name.trim().length === 0 ? 'border-red-400' : 
            formData.name && formData.name.trim().length > 0 ? 'border-green-400' : ''
          }`}
        />
        {formData.name && (
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center z-10">
            {formData.name.trim().length > 0 ? (
              <i className="fas fa-check text-green-600"></i>
            ) : (
              <i className="fas fa-times text-red-600"></i>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Setup</h2>
        <p className="text-gray-600">Create your unique profile</p>
      </div>

      {/* Username Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-at glass-input-icon text-lg"></i>
        </div>
        <input
          type="text"
          value={formData.username}
          onChange={handleUsernameChange}
          required
          placeholder="Username"
          className={`glass-input w-full pl-14 pr-5 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            usernameError ? 'border-red-400' : ''
          }`}
        />
        {usernameError && (
          <p className="text-red-700 text-sm mt-2 ml-2 bg-white/90 rounded px-2 py-1 shadow-sm">{usernameError}</p>
        )}
        {formData.username.length >= 3 && usernameCheck?.available && (
          <p className="text-green-700 text-sm mt-2 ml-2 bg-white/90 rounded px-2 py-1 shadow-sm">✓ Username available</p>
        )}
      </div>

      {/* Phone Number Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-phone glass-input-icon text-lg"></i>
        </div>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => updateFormData("phoneNumber", e.target.value)}
          required
          placeholder="Phone Number"
          className={`glass-input w-full pl-14 pr-12 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber) ? 'border-red-400' : 
            formData.phoneNumber && /^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber) ? 'border-green-400' : ''
          }`}
        />
        {formData.phoneNumber && (
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center z-10">
            {/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber) ? (
              <i className="fas fa-check text-green-600"></i>
            ) : (
              <i className="fas fa-times text-red-600"></i>
            )}
          </div>
        )}
        {formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber) && (
          <p className="text-red-700 text-sm mt-2 ml-2 bg-white/90 rounded px-2 py-1 shadow-sm">
            Please enter a valid phone number
          </p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Interests</h2>
        <p className="text-gray-600">Tell us what you're interested in (optional)</p>
      </div>

      <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
        <InterestSelector
          selectedInterests={formData.interests}
          onInterestsChange={(interests) => updateFormData("interests", interests)}
          showTitle={false}
        />
      </div>

      {/* Account Summary */}
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 border border-white/30 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <i className="fas fa-user-circle mr-2"></i>
          Account Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-800 font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="text-gray-800 font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Username:</span>
            <span className="text-gray-800 font-medium">@{formData.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="text-gray-800 font-medium">{formData.phoneNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Interests:</span>
            <span className="text-gray-800 font-medium">
              {formData.interests.length > 0 ? `${formData.interests.length} selected` : 'None selected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ambrosia-gradient-bg fixed inset-0 z-50 flex flex-col items-center p-4 sm:p-6" style={{ paddingTop: '15vh', paddingBottom: '10vh' }}>
      {/* Logo and Brand Name */}
      <div className={`text-center ${flow === "signUp" ? "mb-4 sm:mb-6" : "mb-6 sm:mb-8"}`}>
        <img 
          src="/logo3.png" 
          alt="Ambrosia Logo" 
          className={`mx-auto drop-shadow-2xl ${
            flow === "signUp" 
              ? "w-36 h-36 sm:w-40 sm:h-40" 
              : "w-72 h-72 sm:w-80 sm:h-80"
          }`}
        />
        <h1 className={`font-bold text-gray-900 mt-2 ${
          flow === "signUp" 
            ? "text-3xl sm:text-4xl" 
            : "text-5xl sm:text-6xl"
        }`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
          Ambrosia
        </h1>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-sm px-2 flex-shrink-0">
        {/* Step Indicator for Sign Up */}
        {flow === "signUp" && <StepIndicator />}

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5">
          {flow === "signIn" ? (
            // Sign In Form (unchanged)
            <>
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                  <i className="fas fa-envelope glass-input-icon text-lg"></i>
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  className="glass-input w-full pl-14 pr-5 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                  <i className="fas fa-lock glass-input-icon text-lg"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Password"
                  className="glass-input w-full pl-14 pr-14 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center hover:scale-110 transition-transform z-10"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} glass-input-icon text-lg`}></i>
                </button>
              </div>
            </>
          ) : (
            // Enhanced Sign Up Wizard Steps
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && (
                <PhoneNumberStep
                  phoneNumber={formData.phoneNumber}
                  onPhoneChange={(phone) => updateFormData("phoneNumber", phone)}
                  onCountryDetected={handleCountryDetected}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 4 && (
                <PrimaryCurrencyStep
                  detectedCountry={formData.detectedCountry}
                  selectedCurrency={formData.primaryCurrency}
                  onCurrencySelect={(currency) => updateFormData("primaryCurrency", currency)}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 5 && (
                <PINSetupStep
                  pin={formData.pin}
                  confirmPin={formData.confirmPin}
                  onPinChange={(pin) => updateFormData("pin", pin)}
                  onConfirmPinChange={(confirmPin) => updateFormData("confirmPin", confirmPin)}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 6 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Interests</h2>
                    <p className="text-gray-600">Tell us what you're interested in (optional)</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
                    <InterestSelector
                      selectedInterests={formData.interests}
                      onInterestsChange={(interests) => updateFormData("interests", interests)}
                      showTitle={false}
                    />
                  </div>

                  <ConfirmationStep
                    formData={formData}
                    onSubmit={handleEnhancedSignUp}
                    onBack={prevStep}
                    isSubmitting={isCreatingAccount}
                  />
                </div>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          {flow === "signUp" ? (
            <div className="pt-2 space-y-3">
              {/* Only show navigation for steps 1-2, other steps handle their own navigation */}
              {(currentStep === 1 || currentStep === 2) && (
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-4 rounded-3xl text-lg font-bold border-2 border-white/40 text-gray-700 hover:bg-white/20 step-nav-button bg-white/10 backdrop-blur-sm"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !stepValidation.step1) ||
                      (currentStep === 2 && (!stepValidation.step2 || !!usernameError))
                    }
                    className="flex-1 black-button py-4 rounded-3xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              )}
              
              {/* Progress Indicator */}
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            // Sign In Button
            <div className="pt-2">
              <button
                type="submit"
                className="black-button w-full py-4 rounded-3xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Toggle Sign In/Sign Up */}
          <div className="text-center pt-4">
            <span className="text-gray-600 text-base">
              {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-gray-800 font-semibold underline hover:text-gray-600 transition-colors text-base"
              onClick={() => handleFlowChange(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-3xl p-4">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Info Messages */}
          {flow === "signUp" && !isCreatingAccount && currentStep === 1 && (
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-3xl p-4">
              <p className="text-blue-800 text-sm font-medium">
                📱 A multi-currency wallet will be automatically created for you upon signup
              </p>
            </div>
          )}

          {isCreatingAccount && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-3xl p-4">
              <p className="text-green-800 text-sm font-medium">
                Creating your multi-currency wallet and sending details to your email...
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}