import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jwt from 'jsonwebtoken'

import login from "../services/login";
import signup from "../services/signup";
import checkTokenValidity from "../services/checkTokenValidity";
import recovery from "../services/recovery";
import changePassword from "../services/changePassword";
import activeAccount from "../services/activeAccount";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [signupMode, setSignupMode] = useState(false);
  const [musicianId, setMusicianID] = useState(null);
  const [venueManagerId, setVenueManagerID] = useState(null);
  const [technicianID, setTechnicianID] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (userInfo) => {
    const loadingLogin = toast.loading("Conectando...");
    try {
      const response = await login(userInfo);

      if (response.status === 404) {
        toast.error("¡Aún no estás registrado!", {
          id: loadingLogin,
        });
        return;
      }

      if (response.status === 403) {
        toast.error("Tu cuenta no está activada", {
          id: loadingLogin,
        });
        return;
      }

      if (response.status !== 200) {
        toast.error("Error al conectar. Comprueba tus datos", {
          id: loadingLogin,
        });
        return;
      }

      setLoggedIn(true);

      toast.success("Estás conectado", {
        id: loadingLogin,
      });
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Error al conectar", {
        id: loadingLogin,
      });
    }
  };

  const handleValidationLogin = () => {
    const loadingLogin = toast.loading("Validando...");
    setLoggedIn(true);
    navigate("/dashboard");

    toast.success("¡Hola de nuevo!", {
      id: loadingLogin,
    });
  };

  const handleSignup = async (userInfo) => {
    const signupToast = toast.loading("Registrando tu cuenta...");
    try {
      const response = await signup(userInfo);

      if (response.status !== 201) {
        toast.error("Error al registrarte. Comprueba tus datos", {
          id: signupToast,
        });
        return;
      }

      toast.success("¡Cuenta registrada!", {
        id: signupToast,
      });
      setSignupMode(false);
      navigate("/login");
    } catch (error) {
      toast.error("Error al registrarte", {
        id: signupToast,
      });
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);

    localStorage.removeItem("jwt-token");
    navigate("/login");
    toast.success("Te has desconectado");
  };

  const handleResetPassword = async (userInfo) => {
    const resetPasswordToast = toast.loading(
      "Enviando email de recuperación..."
    );
    try {
      const response = await recovery(userInfo);

      if (response.status !== 200) {
        toast.error("Error al enviar email de recuperación", {
          id: resetPasswordToast,
        });
        return;
      }

      toast.success("Email de recuperación enviado", {
        id: resetPasswordToast,
      });
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error("Error al enviar el email de recuperación", {
        id: resetPasswordToast,
      });
    }
  };

  const handleChangePassword = async (userInfo, token) => {
    const resetPasswordToast = toast.loading("Cambiando contraseña...");
    try {
      const response = await changePassword(userInfo, token);

      if (response.status !== 200) {
        toast.error("Error al cambiar la contraseña", {
          id: resetPasswordToast,
        });
        return;
      }

      toast.success("Contraseña cambiada", {
        id: resetPasswordToast,
      });
      navigate("/login");
    } catch (error) {
      toast.error("Error al cambiar la contraseña, vuelve a intentarlo", {
        id: resetPasswordToast,
      });
    }
  };

  const handleActiveAccount = async (token) => {
    const activeAccountToast = toast.loading("Activando cuenta...");
    try {
      const response = await activeAccount(token);

      if (response.status !== 200) {
        toast.error("Error al activar la cuenta", {
          id: activeAccountToast,
        });
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al activar la cuenta, vuelve a intentarlo", {
        id: activeAccountToast,
      });
    }
  };

  useEffect(() => {
    checkTokenValidity(handleLogout, handleValidationLogin);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwt-token");
    if (token?.musician_id) {
      setMusicianID(token.musician_id);
    }
    if (token?.technician_id) {
      setTechnicianID(token.technician_id);
    }
    if (token?.venue_manager_id) {
      setVenueManagerID(token.venue_manager_id);
    }
  }, [loggedIn]);

  const actions = {
    setSignupMode,
    setLoggedIn,
    handleLogin,
    handleSignup,
    handleLogout,
    handleResetPassword,
    handleChangePassword,
    handleActiveAccount,
    setMusicianID,
    setTechnicianID,
    setVenueManagerID,
  };

  const store = {
    signupMode,
    loggedIn,
    musicianId,
    technicianID,
    venueManagerId,
  };

  return (
    <LoginContext.Provider value={{ actions, store }}>
      {children}
    </LoginContext.Provider>
  );
};

const useLoginContext = () => useContext(LoginContext);

export default useLoginContext;
