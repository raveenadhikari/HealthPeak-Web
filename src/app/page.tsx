"use client";

import styles from "./page.module.css";
import { useState, useRef, FormEvent } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay },
  }),
};

type Contribution = {
  feature: string;
  contribution: number;
};

export default function Home() {
  // insertion order here dictates form field order
  const [formData, setFormData] = useState({
    Age: "",
    Sex: "",
    Marital: "",
    Race: "",
    WaistCirc: "",
    UricAcid: "",
    BloodGlucose: "",
    HDL: "",
    Triglycerides: "",
    UrAlbCr: "",
    Albuminuria: "",
  });
  const [userName, setUserName] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [personalizedTips, setPersonalizedTips] = useState<
  { feature: string; tip: string }[]>([]);
  const formRef = useRef<HTMLElement>(null);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const healthTips: Record<string, string> = {
    BloodGlucose: "Control your blood sugar by reducing refined carbs, sugar-sweetened beverages, and increasing fiber intake.",
    HDL: "Boost your HDL by incorporating healthy fats like olive oil, fatty fish, and exercising regularly.",
    Triglycerides: "Reduce triglycerides by cutting down on alcohol, processed sugar, and saturated fats.",
    WaistCirc: "Engage in daily physical activity and reduce caloric intake to lower abdominal fat.",
    UricAcid: "Limit red meat and sugary foods, and drink plenty of water to lower uric acid levels.",
    UrAlbCr: "Manage your blood pressure and sugar to protect your kidney function and reduce albumin-creatinine ratio.",
    Albuminuria: "Monitor blood pressure, control blood sugar, and reduce sodium intake to slow kidney damage.",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const goToForm = () => {
    if (!userName.trim()) return;
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderAnimatedCircle = () => {
    const radius = 60;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = circumference - (animatedPercent / 100) * circumference;
  
    return (
      <motion.div
        className={styles.resultCircleWrapper}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <svg
          height={radius * 2}
          width={radius * 2}
        >
          <circle
            stroke="#e5e7eb" /* light gray bg track */
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#3b82f6" /* light blue progress */
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#1f2937"
            fontSize="20px"
            fontWeight="bold"
          >
            {animatedPercent}%
          </text>
        </svg>
      </motion.div>
    );
  };

  const renderInsightMessage = (feature: string) => {
    const messages: Record<string, string> = {
      BloodGlucose: "🩸 You have elevated blood glucose levels, which increase your metabolic risk.",
      HDL: "📉 Your HDL (good cholesterol) is lower than ideal.",
      Triglycerides: "📈 High triglyceride levels are contributing to your result.",
      WaistCirc: "📏 Abdominal obesity (waist circumference) is a significant factor.",
      UricAcid: "🧪 Elevated uric acid is associated with increased inflammation and risk.",
      UrAlbCr: "🔬 Your urine albumin-creatinine ratio suggests potential kidney stress.",
      Albuminuria: "🧫 Signs of albuminuria indicate kidney involvement.",
    };
  
    return messages[feature] || `${feature} is contributing to your risk.`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // build payload, convert numeric fields
    const payload = {
      Age: parseInt(formData.Age, 10),
      Sex: formData.Sex,
      Marital: formData.Marital,
      Race: formData.Race,
      WaistCirc: parseFloat(formData.WaistCirc),
      UricAcid: parseFloat(formData.UricAcid),
      BloodGlucose: parseFloat(formData.BloodGlucose),
      HDL: parseFloat(formData.HDL),
      Triglycerides: parseFloat(formData.Triglycerides),
      UrAlbCr: parseFloat(formData.UrAlbCr),
      Albuminuria: parseInt(formData.Albuminuria, 10),
    };

    try {
      const res = await fetch("https://web-production-cc078.up.railway.app/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data.probability);
      let start = 0;
      const end = Math.round(data.probability * 100);
      const duration = 1000; // in ms
      const stepTime = 15;

      const animate = () => {
        const increment = Math.ceil(end / (duration / stepTime));
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedPercent(start);
        }, stepTime);
      };
      animate();
      setContributions(data.contributions);
      const actionableFeatures = Object.keys(healthTips);

      const filteredTips = data.contributions
        .filter((c: Contribution) => actionableFeatures.includes(c.feature))
        .map((c: Contribution) => ({
          feature: c.feature,
          tip: healthTips[c.feature],
        }));

      setPersonalizedTips(filteredTips);
      
    } catch (err) {
      console.error("Prediction error:", err);
    }
    


  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>MetaPredict</div>
        <div className={styles.navLinks}>
          <a href="#hero">Home</a>
          <a href="#form">Predict</a>
          <a href="#prevention">Prevention</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* HERO */}
      <motion.section
        id="hero"
        className={styles.hero}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.6 }}
        variants={fadeIn}
      >
        <h1>Welcome to MetaPredict</h1>
        <p>Empowering you with AI insights to assess your Metabolic Syndrome risk.</p>

        <div className={styles.heroInputRow}>
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button
            type="button"
            onClick={goToForm}
            disabled={!userName.trim()}
            style={{ opacity: userName.trim() ? 1 : 0.5 }}
          >
            Next
          </button>
        </div>

        {userName && <p style={{ marginTop: 10, fontWeight: "bold" }}>Hi, {userName} 👋</p>}
      </motion.section>

      <motion.section
        id="definition"
        className={styles.infoSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.5 }}
        variants={fadeIn}
      >
        <h2  className={styles.centeredHeading}>What is Metabolic Syndrome?</h2>
        <p className={styles.definition}>
          Metabolic Syndrome is a cluster of conditions — including high blood pressure, high blood sugar,
          excess body fat around the waist, and abnormal cholesterol or triglyceride levels — that occur
          together, increasing your risk of heart disease, stroke, and type 2 diabetes.
        </p>

        <div className={styles.infoGrid}>
        <motion.div
          className={`${styles.card} ${styles.cardBlue}`}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
            <h3>🔍 Common Symptoms</h3>
            <div className={styles.cardLine}> Increased waist circumference</div>
            <div className={styles.cardLine}> Fatigue or low energy</div>
            <div className={styles.cardLine}> Elevated blood pressure</div>
            <div className={styles.cardLine}> Insulin resistance</div>
            <div className={styles.cardLine}> High fasting blood sugar</div>
          </motion.div>

          <motion.div
            className={`${styles.card} ${styles.cardYellow}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3>⚠️ Primary Causes</h3>
            <div className={styles.cardLine}> Abdominal obesity</div>
            <div className={styles.cardLine}> Physical inactivity</div>
            <div className={styles.cardLine}> High-sugar, high-fat diet</div>
            <div className={styles.cardLine}> Genetics</div>
            <div className={styles.cardLine}> Stress and poor sleep</div>
          </motion.div>

          <motion.div
            className={`${styles.card} ${styles.cardRed}`}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3>🧬 Health Risks</h3>
            <div className={styles.cardLine}> Type 2 Diabetes</div>
            <div className={styles.cardLine}> Cardiovascular disease</div>
            <div className={styles.cardLine}> Liver & kidney damage</div>
            <div className={styles.cardLine}> Inflammation</div>
            <div className={styles.cardLine}> Reduced lifespan</div>
          </motion.div>
        </div>

      </motion.section>

      {/* FORM SECTION */}
      <section
        id="form"
        ref={formRef}
        className={styles.section}
        //initial="hidden"
       // whileInView="visible"
       // viewport={{ amount: 0.5 }}
        //variants={fadeIn}
      >
        <h2>Risk Assessment Form</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: 5 }}>{key}:</label>
                <input
                  type="text"
                  name={key}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>
          <button type="submit" style={{ marginTop: 20 }}>
            Predict
          </button>
        </form>

        {result !== null && (
          <motion.div
            className={styles.resultBox}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={fadeIn}
          >
            <div className={styles.resultText}>
              <p>{userName}, your predicted risk of Metabolic Syndrome is:</p>
            </div>
            {renderAnimatedCircle()}
            
            

            {/* CONTRIBUTIONS TABLE */}
            <div className={styles.contributionList}>
              <h3>🧠 Key Risk Insights</h3>
              <ul>
                {personalizedTips.map((tip, i) => (
                  <li key={i}>
                    {renderInsightMessage(tip.feature)}
                  </li>
                ))}
              </ul>
            </div>
            {personalizedTips.length > 0 && (
              <div className={styles.tipsBox}>
                <h3>✅ Personalized Prevention Tips</h3>
                <ul>
                  {personalizedTips.map((tip, i) => (
                    <li key={i}>
                      <strong>{tip.feature}:</strong> {tip.tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* PREVENTION */}
      <motion.section
        id="prevention"
        className={styles.section}
        style={{ backgroundColor: "var(--color-secondary)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.5 }}
        variants={fadeIn}
      >
        <h2>Prevention Tips</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Eat a balanced, low-sugar diet</li>
          <li>Engage in regular physical activity</li>
          <li>Manage cholesterol and blood pressure</li>
          <li>Get enough quality sleep</li>
          <li>Reduce stress through mindfulness or therapy</li>
        </ul>
      </motion.section>

      {/* ABOUT */}
      <motion.section
        id="about"
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.5 }}
        variants={fadeIn}
      >
        <h2>About Us</h2>
        <p>
          We’re a team of health tech enthusiasts using AI to make preventative care accessible and
          personal. (More coming soon!)
        </p>
      </motion.section>

      {/* CONTACT */}
      <motion.section
        id="contact"
        className={styles.section}
        style={{ backgroundColor: "var(--color-muted)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.5 }}
        variants={fadeIn}
      >
        <h2>Contact Us</h2>
        <p>
          <strong>Email:</strong> contact@metapredict.ai
        </p>
        <p>
          <strong>Phone:</strong> +1 (555) 123-4567
        </p>
      </motion.section>
    </div>
  );
}
