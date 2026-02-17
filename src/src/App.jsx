import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Factory, TrendingUp, Package, Users, Settings, AlertTriangle, Key, Eye, EyeOff, LogOut, CheckCircle } from "lucide-react";

export default function ProductionChatbot() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(() => sessionStorage.getItem("anthropic_key") || "");
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [isValidatingKey, setIsValidatingKey] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant de gestion de production. Je peux vous aider avec le suivi des ordres de fabrication, la gestion des stocks, la planification de la production, l'analyse de performance (OEE, TRS), et bien plus encore. Comment puis-je vous aider aujourd'hui ?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickActions = [
    { icon: Factory, label: "Statut Production", query: "Quel est le statut actuel de la production ?" },
    { icon: TrendingUp, label: "Performance OEE", query: "Comment calculer et amÃ©liorer l'OEE ?" },
    { icon: Package, label: "Gestion Stock", query: "Comment gÃ©rer les stocks de matiÃ¨res premiÃ¨res ?" },
    { icon: Users, label: "Planning Ã‰quipes", query: "Aide-moi Ã  organiser les Ã©quipes de production" },
  ];

  const handleSaveKey = async () => {
    if (!apiKey.trim().startsWith("sk-ant-")) {
      setKeyError("La clÃ© doit commencer par 'sk-ant-'. VÃ©rifiez que vous avez bien copiÃ© votre clÃ© Anthropic.");
      return;
    }
    setIsValidatingKey(true);
    setKeyError("");
    // Validation rapide avec un appel test
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "Test" }]
        })
      });
      if (res.status === 401) {
        setKeyError("ClÃ© API invalide. VÃ©rifiez que vous avez bien copiÃ© la clÃ© depuis console.anthropic.com.");
        return;
      }
      sessionStorage.setItem("anthropic_key", apiKey.trim());
      setSavedKey(apiKey.trim());
    } catch {
      // En cas d'erreur rÃ©seau, on accepte quand mÃªme la clÃ©
      sessionStorage.setItem("anthropic_key", apiKey.trim());
      setSavedKey(apiKey.trim());
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("anthropic_key");
    setSavedKey("");
    setApiKey("");
    setMessages([{
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant de gestion de production. Je peux vous aider avec le suivi des ordres de fabrication, la gestion des stocks, la planification de la production, l'analyse de performance (OEE, TRS), et bien plus encore. Comment puis-je vous aider aujourd'hui ?"
    }]);
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;
    const userMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": savedKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es un assistant expert en gestion de la production industrielle, conÃ§u pour aider des Ã©tudiants en formation. Tu dois expliquer clairement et de faÃ§on pÃ©dagogique les sujets suivants :
- Le suivi et la gestion des ordres de fabrication
- La planification de la production et l'ordonnancement
- La gestion des stocks et des matiÃ¨res premiÃ¨res
- L'analyse de performance (OEE, TRS, taux de rebut)
- La maintenance prÃ©ventive et corrective
- La gestion des Ã©quipes et des compÃ©tences
- L'optimisation des processus de production (Lean, 5S, Kaizen)
- La qualitÃ© et le contrÃ´le qualitÃ© (SPC, AMDEC)
- La conformitÃ© et les normes industrielles (ISO 9001, ISO 14001)

Adapte ton niveau de langage Ã  des Ã©tudiants en formation industrielle. Fournis des dÃ©finitions claires, des exemples concrets, des formules de calcul et des schÃ©mas textuels si utile. Sois encourageant et pÃ©dagogue.`,
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setMessages(prev => [...prev, { role: "assistant", content: data.content[0].text }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "âš ï¸ Erreur : " + (error.message || "VÃ©rifiez votre clÃ© API et rÃ©essayez.")
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // â”€â”€â”€ Ã‰CRAN DE SAISIE DE CLÃ‰ API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!savedKey) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1e1e1e 100%)",
        fontFamily: '"Space Mono", "Courier New", monospace',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Grille de fond */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(255,153,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,0,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px", pointerEvents: "none"
        }} />

        <div style={{
          width: "100%", maxWidth: "540px",
          background: "rgba(0,0,0,0.6)",
          border: "2px solid rgba(255,153,0,0.4)",
          borderRadius: "16px", padding: "3rem",
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,153,0,0.1)",
          animation: "fadeIn 0.6s ease-out"
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{
              width: "72px", height: "72px",
              background: "linear-gradient(135deg, #ff9900, #ff6600)",
              borderRadius: "16px", border: "3px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 8px 25px rgba(255,153,0,0.4)"
            }}>
              <Factory size={36} color="#000" strokeWidth={2.5} />
            </div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "1.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.5px" }}>
              PRODUCTION AI
            </h1>
            <p style={{ margin: "0.5rem 0 0", color: "#ff9900", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "2px" }}>
              ASSISTANT PÃ‰DAGOGIQUE
            </p>
          </div>

          {/* Instructions */}
          <div style={{
            background: "rgba(255,153,0,0.08)", border: "1px solid rgba(255,153,0,0.2)",
            borderRadius: "10px", padding: "1.2rem 1.5rem", marginBottom: "2rem"
          }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: "0.88rem", lineHeight: 1.7 }}>
              <strong style={{ color: "#ff9900" }}>ðŸ“˜ Ã‰tudiant(e) ?</strong><br />
              Pour utiliser cet assistant, vous avez besoin d'une <strong>clÃ© API Anthropic gratuite</strong>.<br />
              CrÃ©ez votre compte sur{" "}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                style={{ color: "#ff9900", textDecoration: "underline" }}>console.anthropic.com</a>{" "}
              puis copiez votre clÃ© ci-dessous.
            </p>
          </div>

          {/* Ã‰tapes */}
          {[
            "CrÃ©ez un compte sur console.anthropic.com",
            "Allez dans API Keys â†’ Create Key",
            "Copiez la clÃ© (commence par sk-ant-)",
            "Collez-la ci-dessous et cliquez sur DÃ©marrer"
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start", marginBottom: "0.7rem" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%",
                background: "linear-gradient(135deg, #ff9900, #ff6600)",
                color: "#000", fontWeight: 900, fontSize: "0.8rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, border: "2px solid #000"
              }}>{i + 1}</div>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.5, paddingTop: "3px" }}>{step}</span>
            </div>
          ))}

          {/* Champ clÃ© */}
          <div style={{ marginTop: "2rem", position: "relative" }}>
            <label style={{ display: "block", color: "#ff9900", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              <Key size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Votre clÃ© API
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setKeyError(""); }}
                onKeyPress={e => e.key === "Enter" && handleSaveKey()}
                placeholder="sk-ant-api03-..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${keyError ? "#ff4444" : "rgba(255,153,0,0.3)"}`,
                  borderRadius: "8px", padding: "0.9rem 3rem 0.9rem 1rem",
                  color: "#fff", fontSize: "0.9rem", fontFamily: "inherit",
                  outline: "none"
                }}
              />
              <button onClick={() => setShowKey(!showKey)} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: 0
              }}>
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {keyError && (
              <p style={{ margin: "0.5rem 0 0", color: "#ff4444", fontSize: "0.8rem" }}>
                âš ï¸ {keyError}
              </p>
            )}
          </div>

          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim() || isValidatingKey}
            style={{
              marginTop: "1.5rem", width: "100%",
              background: apiKey.trim() ? "linear-gradient(135deg, #ff9900, #ff6600)" : "rgba(100,100,100,0.3)",
              border: "2px solid #000", borderRadius: "10px",
              padding: "1rem", cursor: apiKey.trim() ? "pointer" : "not-allowed",
              color: "#000", fontWeight: 900, fontSize: "1rem",
              fontFamily: "inherit", letterSpacing: "1px", textTransform: "uppercase",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              transition: "all 0.3s ease",
              boxShadow: apiKey.trim() ? "0 4px 15px rgba(255,153,0,0.4)" : "none"
            }}
          >
            {isValidatingKey ? <><Loader2 size={18} className="spin" /> VÃ©rification...</> : <><CheckCircle size={18} /> DÃ©marrer l'assistant</>}
          </button>

          <p style={{ margin: "1.5rem 0 0", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", textAlign: "center" }}>
            ðŸ”’ Votre clÃ© est stockÃ©e uniquement dans votre navigateur (session) et n'est jamais envoyÃ©e Ã  nos serveurs.
          </p>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  // â”€â”€â”€ INTERFACE PRINCIPALE DU CHATBOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      fontFamily: '"Space Mono", "Courier New", monospace',
      position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,153,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,0,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #ff9900 0%, #ff6600 100%)",
        padding: "1.2rem 2rem", borderBottom: "4px solid #000",
        boxShadow: "0 4px 20px rgba(255,153,0,0.3)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Factory size={30} color="#000" strokeWidth={2.5} />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#000", letterSpacing: "-0.5px", textTransform: "uppercase" }}>
                PRODUCTION AI
              </h1>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(0,0,0,0.65)", fontWeight: 700, letterSpacing: "1px" }}>
                ASSISTANT PÃ‰DAGOGIQUE
              </p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: "rgba(0,0,0,0.2)", border: "2px solid rgba(0,0,0,0.3)",
            borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer",
            color: "#000", fontFamily: "inherit", fontWeight: 700, fontSize: "0.8rem",
            display: "flex", alignItems: "center", gap: "0.4rem",
            textTransform: "uppercase", letterSpacing: "0.5px"
          }}>
            <LogOut size={16} /> Changer de clÃ©
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", position: "relative" }}>
        {/* Actions rapides */}
        {messages.length === 1 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: "#ff9900", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={16} /> Suggestions pour commencer
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {quickActions.map((action, i) => (
                <button key={i} onClick={() => handleSend(action.query)} style={{
                  background: "rgba(255,153,0,0.08)", border: "2px solid rgba(255,153,0,0.25)",
                  borderRadius: "10px", padding: "1.2rem", cursor: "pointer",
                  textAlign: "left", transition: "all 0.3s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,153,0,0.18)"; e.currentTarget.style.borderColor = "#ff9900"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,153,0,0.08)"; e.currentTarget.style.borderColor = "rgba(255,153,0,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <action.icon size={22} color="#ff9900" strokeWidth={2} style={{ marginBottom: "0.5rem" }} />
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>{action.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{
          background: "rgba(0,0,0,0.4)", borderRadius: "12px",
          border: "2px solid rgba(255,153,0,0.2)", padding: "2rem",
          minHeight: "450px", maxHeight: "560px", overflowY: "auto",
          marginBottom: "1.5rem", backdropFilter: "blur(10px)"
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "8px",
                background: msg.role === "assistant" ? "linear-gradient(135deg, #ff9900, #ff6600)" : "linear-gradient(135deg, #555, #888)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, border: "2px solid #000"
              }}>
                {msg.role === "assistant" ? <Settings size={18} color="#000" strokeWidth={2.5} /> : <Users size={18} color="#fff" strokeWidth={2.5} />}
              </div>
              <div style={{
                flex: 1,
                background: msg.role === "assistant" ? "rgba(255,153,0,0.08)" : "rgba(255,255,255,0.05)",
                padding: "1rem 1.5rem", borderRadius: "8px",
                border: msg.role === "assistant" ? "1px solid rgba(255,153,0,0.25)" : "1px solid rgba(255,255,255,0.1)",
                color: "#fff", lineHeight: "1.7", fontSize: "0.93rem",
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "linear-gradient(135deg, #ff9900, #ff6600)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #000" }}>
                <Loader2 size={18} color="#000" className="spin" />
              </div>
              <span style={{ color: "#ff9900", fontSize: "0.88rem", fontWeight: 600 }}>Analyse en cours...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Saisie */}
        <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: "12px", border: "2px solid rgba(255,153,0,0.25)", padding: "1.2rem", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Posez votre question sur la gestion de la production... (EntrÃ©e pour envoyer)"
              disabled={isLoading}
              rows={2}
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)",
                border: "2px solid rgba(255,153,0,0.2)", borderRadius: "8px",
                padding: "0.8rem 1rem", color: "#fff", fontSize: "0.92rem",
                fontFamily: "inherit", resize: "none", outline: "none",
                transition: "border-color 0.3s"
              }}
              onFocus={e => e.target.style.borderColor = "#ff9900"}
              onBlur={e => e.target.style.borderColor = "rgba(255,153,0,0.2)"}
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} style={{
              background: input.trim() && !isLoading ? "linear-gradient(135deg, #ff9900, #ff6600)" : "rgba(100,100,100,0.3)",
              border: "2px solid #000", borderRadius: "8px",
              padding: "0.9rem 1.5rem", cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              color: "#000", fontFamily: "inherit", fontWeight: 700, fontSize: "0.85rem",
              letterSpacing: "1px", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "0.4rem",
              transition: "all 0.3s ease",
              boxShadow: input.trim() && !isLoading ? "0 4px 15px rgba(255,153,0,0.35)" : "none"
            }}>
              {isLoading ? <><Loader2 size={16} className="spin" /></> : <><Send size={16} /> Envoyer</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        ::placeholder { color: rgba(255,255,255,0.35); }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 6px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #ff9900, #ff6600); border-radius: 6px; border: 2px solid #000; }
      `}</style>
    </div>
  );
}
