import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function PhoneAuth({ onVerified }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const sendCode = async () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });

    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error("Error enviando código:", error);
    }
  };

  const verifyCode = async () => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      onVerified(userCredential.user.phoneNumber);
    } catch (error) {
      console.error("Código incorrecto:", error);
    }
  };

  return (
    <div>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Número de teléfono"
      />
      <button onClick={sendCode}>Enviar código</button>
      <div id="recaptcha-container"></div>
      {confirmationResult && (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Código OTP"
          />
          <button onClick={verifyCode}>Verificar</button>
        </>
      )}
    </div>
  );
}