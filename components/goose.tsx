import React, { useState, useEffect } from "react";

interface GooseFooterProps {
  message: string;
  ascii: string;
}

const GooseFooter: React.FC<GooseFooterProps> = ({ message, ascii }) => {
  const [honkCount, setHonkCount] = useState(0);
  const [isGooseAwake, setIsGooseAwake] = useState(true);
  const [wisdom, setWisdom] = useState("");
  const [showKonami, setShowKonami] = useState(false);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);

  const gooseWisdom = [
    'Гусь говорит: "Хороший код как гусиное перо - легкий и острый"',
    'Гусь мудрствует: "Баг в коде - это не баг, это фича для гусей"',
    'Гусь советует: "Рефакторинг - это как чистка перьев, делать нужно регулярно"',
    'Гусь утверждает: "Комментарии в коде должны быть как гусиное гоготание - понятны всем"',
    'Гусь знает: "Лучший код - это код, который гусь может прочитать"',
    'Гусь предупреждает: "Спагетти-код хуже змеи для гуся"',
    'Гусь объясняет: "Git blame - это как память гуся, всё помнит"',
    'Гусь философствует: "Код без тестов как полет без крыльев"',
  ];

  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = [...konamiSequence, event.key];

      if (newSequence.length > konamiCode.length) {
        newSequence.shift();
      }

      setKonamiSequence(newSequence);

      if (newSequence.join(",") === konamiCode.join(",")) {
        setShowKonami(true);
        setTimeout(() => setShowKonami(false), 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiSequence]);

  const handleGooseClick = () => {
    setHonkCount((prev) => prev + 1);
    setWisdom(gooseWisdom[Math.floor(Math.random() * gooseWisdom.length)]);

    if (honkCount === 9) {
      setIsGooseAwake(false);
      setTimeout(() => {
        setIsGooseAwake(true);
        setHonkCount(0);
      }, 3000);
    }
  };

  const handleRandomGoose = () => {
    const gooseEmojis = ["🦆", "🦢", "🪿", "🐧", "🐦"];
    const randomEmoji =
      gooseEmojis[Math.floor(Math.random() * gooseEmojis.length)];
    alert(`${randomEmoji} Случайный гусь появился! Удачи в разработке!`);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
        padding: "40px 20px",
        textAlign: "center",
        fontFamily: "monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {showKonami && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ff6b6b",
            color: "white",
            padding: "10px 20px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 1000,
            animation: "pulse 1s infinite",
          }}
        >
          🦆 СЕКРЕТНЫЙ ГУСИНЫЙ КОД АКТИВИРОВАН! 🦆
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ color: "#2c3e50", margin: "0 0 10px 0" }}>{message}</h3>
      </div>

      <div
        onClick={handleGooseClick}
        style={{
          cursor: "pointer",
          fontSize: "12px",
          lineHeight: "1.2",
          color: isGooseAwake ? "#2c3e50" : "#7f8c8d",
          marginBottom: "20px",
          transition: "all 0.3s ease",
          transform: isGooseAwake ? "scale(1)" : "scale(0.8)",
          filter: isGooseAwake ? "none" : "blur(1px)",
        }}
        title="Нажмите на гуся для мудрости!"
      >
        <pre style={{ margin: 0, whiteSpace: "pre" }}>{ascii}</pre>
      </div>

      {!isGooseAwake && (
        <div
          style={{ color: "#7f8c8d", fontSize: "14px", marginBottom: "10px" }}
        >
          💤 Гусь спит... Слишком много гоготал...
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleRandomGoose}
          style={{
            background: "#3498db",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "10px",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#2980b9")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#3498db")}
        >
          🦆 Случайный гусь
        </button>

        <span
          style={{
            color: "#7f8c8d",
            fontSize: "12px",
            display: "inline-block",
            marginLeft: "10px",
          }}
        >
          Гусь гоготнул: {honkCount} раз
        </span>
      </div>

      {wisdom && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "10px",
            padding: "15px",
            margin: "20px auto",
            maxWidth: "500px",
            color: "#856404",
            fontSize: "14px",
            fontStyle: "italic",
          }}
        >
          {wisdom}
        </div>
      )}

      <div
        style={{
          color: "#7f8c8d",
          fontSize: "12px",
          marginTop: "20px",
          borderTop: "1px solid #ecf0f1",
          paddingTop: "15px",
        }}
      >
        <p>Секретный гусиный уровень SourceCraft Sites</p>
        <p>Попробуйте Konami Code: ↑↑↓↓←→←→</p>
        <p style={{ fontSize: "10px", opacity: 0.7 }}>
          © {new Date().getFullYear()} Главный гусь SourceCraft. Все права защищены гусиным законом.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GooseFooter;
