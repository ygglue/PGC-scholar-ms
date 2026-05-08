import { useState, useEffect } from "react";
import { CacheService } from "../services/cacheService";
import { NetworkStatus } from "../services/networkStatus";
import api from "../services/apiService";
import { getToken, saveToken, removeToken } from "../services/secureStore";
import { ModalProps } from "./shared/Modal";

interface LoginProps {
  onSuccess: (token: string) => void;
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onShowModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    tryAutoLogin();
  }, []);

  const tryAutoLogin = async () => {
    const cachedToken = await getToken();
    if (!cachedToken) return;

    setStatus("Checking saved session...");
    const isOnline = await NetworkStatus.checkApiConnection();

    if (isOnline) {
      try {
        // Since we are evaluators, let's try a generic check or assume the login is enough
        // For now, if token exists, we just trust it to proceed to dashboard
        onSuccess(cachedToken);
      } catch {
        setError("Session expired or network error.");
        await removeToken();
      }
    } else {
      setStatus("Working offline with saved session...");
      onSuccess(cachedToken);
    }
  };

  const attemptLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("Signing in...");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        const token = response.data.access_token;
        await saveToken(token);
        onSuccess(token);
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setStatus(null);
    }
  };

  const handleClearCache = async () => {
    onShowModal({
      title: 'Clear Cache',
      message: 'This will delete all cached data and your saved session. Continue?',
      type: 'danger',
      confirmLabel: 'Clear Everything',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        CacheService.clearAll();
        await removeToken();
        onShowModal({
          title: 'Cache Cleared',
          message: 'All local data has been removed.',
          type: 'success',
          onConfirm: () => window.location.reload()
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F0] p-4">
      <div className="auth-card">
        <h1 className="font-bold text-[32px] text-[#1A1A1A] mb-2">Evaluator Portal</h1>
        <p className="text-[#4A5568] mb-6">Sign in to manage scholars</p>

        {status && <p className="text-[#1A8C3C] text-sm mb-4">{status}</p>}
        {error && <p className="text-[#E53935] text-sm mb-4">{error}</p>}

        <form onSubmit={attemptLogin} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Evaluator Email"
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field"
          />
          <button
            type="submit"
            className="btn-primary"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleClearCache}
            className="text-[#4A5568] hover:text-[#1A8C3C] text-sm underline"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};
