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
      //const res = await fetch("https://web-production-cc078.up.railway.app/predict",
      //const res = await fetch("http://127.0.0.1:8000/predict",

      const res = await fetch("https://web-production-cc078.up.railway.app/predict" ,{
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
            placeholder="Enter Your Name to Start Prediction.."
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
        <a href="#definition" className={styles.scrollArrow}>
            ↓
          </a>
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
        <div className={styles.definitionWrapper}>
        <p className={styles.definition}>
          Metabolic Syndrome is not a single disease, but rather a combination of interconnected conditions
          such as high blood pressure, elevated blood sugar levels, excess abdominal fat, and abnormal cholesterol
          or triglyceride levels. These factors significantly increase the risk of serious health problems like
          heart disease, stroke, and type 2 diabetes. Often triggered by lifestyle habits such as poor diet,
          inactivity, and chronic stress, Metabolic Syndrome is becoming increasingly common worldwide. 
          Early detection and targeted prevention strategies can greatly reduce its long-term impact.
        </p>
          <img
            src="/intro.jpeg" // <-- Add your own image here (e.g., in /public folder)
            alt="Metabolic Syndrome Illustration"
            className={styles.definitionImage}
          />
        </div>

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
            {Object.keys(formData).map((key) => {
              const isDropdown = ["Sex", "Marital", "Race", "Albuminuria"].includes(key);
              const options: Record<string, string[]> = {
                Sex: ["Male", "Female"],
                Marital: ["Single", "Married", "Widowed", "Divorced", "Separated"],
                Race: ["White", "Asian", "Black", "MexAmerican", "Hispanic", "Other"],
                Albuminuria: ["0", "1"],
              };

              const unitMap: Record<string, string> = {
                WaistCirc: "cm",
                UricAcid: "mg/dL",
                BloodGlucose: "mg/dL",
                HDL: "mg/dL",
                Triglycerides: "mg/dL",
                UrAlbCr: "mg/g",
              };

              const placeholderMap: Record<string, string> = {
                WaistCirc: "Waist circumference",
                UricAcid: "Serum uric acid level",
                BloodGlucose: "Fasting blood glucose",
                HDL: "Good cholesterol",
                Triglycerides: "Fat in blood",
                UrAlbCr: "Urine albumin/creatinine",
                Albuminuria: "Albumin in urine (0/1)",
              };

              return (
                <div key={key} className={styles.inputWithUnit}>
                  <label style={{ display: "block", marginBottom: 5 }}>{key}:</label>

                  {isDropdown ? (
                    <select
                      name={key}
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      required
                    >
                      <option value="">-- Select --</option>
                      {options[key].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={styles.unitInputWrapper}>
                      <input
                        type="text"
                        name={key}
                        value={formData[key as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={placeholderMap[key] || ""}
                        required
                      />
                      {unitMap[key] && <span className={styles.unitLabel}>{unitMap[key]}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ✅ Predict Button */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button type="submit">Predict</button>
          </div>
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
            {result > 0.5 ? (
  <>
    <div className={styles.contributionList}>
          <h3>🧠 Key Risk Insights</h3>
          <ul>
            {personalizedTips.map((tip, i) => (
              <li key={i}>{renderInsightMessage(tip.feature)}</li>
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
      </>
    ) : (
      <div
        style={{
          backgroundColor: "#e0fce6",
          padding: "24px",
          borderRadius: "12px",
          textAlign: "center",
          marginTop: "30px",
          boxShadow: "var(--shadow)",
        }}
      >
        <h3 style={{ color: "#047857", marginBottom: "10px" }}>🎉 Low Risk</h3>
        <p>
          Great news! Your predicted risk of Metabolic Syndrome is low. Keep up the healthy lifestyle to maintain it!
        </p>
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

        {/* ✅ NEW PERMANENT PARAGRAPH CARDS */}
        <div className={styles.tipCardGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipCardContent}>
              <h3>Reducing Waist Circumference</h3>
              <p>
                A combination of regular cardio, strength training, and core exercises can help reduce
                abdominal fat. Engage in brisk walking, cycling, or dancing 3–5 times a week, and add
                strength training for major muscle groups 2–3 times. Core workouts like planks and leg
                raises enhance muscle tone. Always warm up and stretch, and rest at least once a week.
              </p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipCardContent}>
              <h3>Precautions for Low HDL</h3>
              <p>
                Raise your HDL by consuming healthy fats like olive oil, nuts, fatty fish, and omega-3-rich
                seeds. Avoid trans and saturated fats. Stay physically active (30 mins/day), quit smoking,
                limit alcohol, and maintain a healthy weight. These habits can naturally boost HDL and
                support heart health.
              </p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipCardContent}>
              <h3>Managing High Blood Sugar</h3>
              <p>
                Choose low-glycemic, high-fiber foods like vegetables, legumes, and whole grains. Reduce
                sugary drinks and refined carbs. Practice portion control, stay active daily, manage stress,
                eat consistently, and get 7–9 hours of sleep. Losing 5–7% of body weight can greatly improve
                glucose control.
              </p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipCardContent}>
              <h3>Dealing with High Triglycerides</h3>
              <p>
                Avoid added sugars and refined carbs. Choose whole grains, healthy oils, and omega-3-rich
                foods like fatty fish and flaxseeds. Exercise 30–45 minutes on most days and limit alcohol
                to reduce triglyceride spikes. Even modest weight loss (5–10%) significantly helps.
              </p>
            </div>
          </div>
        </div>

      </motion.section>


      <motion.section
        id="about"
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.5 }}
        variants={fadeIn}
      >
        <h2>About Us</h2>
        <p style={{ marginBottom: "30px" }}>
          We are a team of data science students dedicated to early disease prediction using AI. 
          This platform was built as part of our group research project to promote awareness and prevention of Metabolic Syndrome.
        </p>
        <p style={{ marginTop: "30px", fontWeight: "bold" }}>
          Group 03 – Final  Project
        </p>

        <div className={styles.teamGrid}>
          <div className={styles.teamCard}>
            <img src="/Chathuni.jpeg" alt="Member 1" className={styles.teamPhoto} />
            <h3>Chathuni Rathnathilake</h3>
            <p>BSc (Hons) Data Science</p>
          </div>
          <div className={styles.teamCard}>
            <img src="Ashani.jpg" alt="Member 2" className={styles.teamPhoto} />
            <h3>Ashani <br/>Madhushika</h3>
            <p>BSc (Hons) Statistics</p>
          </div>
          <div className={styles.teamCard}>
            <img src="sadu.jpeg" alt="Member 3" className={styles.teamPhoto} />
            <h3>Sandunika Muhandiramge</h3>
            <p>BSc (Hons) Statistics</p>
          </div>
        </div>

       
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
        <strong>Email Contact: </strong>
        MetaAi@gmail.com
        
      </p>

      <p>
        <strong>Phone:</strong> +1 (555) 123-4567
      </p>
      <h3 style={{ marginTop: "40px", marginBottom: "20px" }}>We’d Love Your Feedback</h3>
        <form className={styles.feedbackForm} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.feedbackCard}>
            <div className={styles.feedbackField}>
              <label>Name (optional):</label>
              <input type="text" name="name" placeholder="Your name" />
            </div>
            <div className={styles.feedbackField}>
              <label>Email (optional):</label>
              <input type="email" name="email" placeholder="you@example.com" />
            </div>
            <div className={styles.feedbackField}>
              <label>Your Feedback:</label>
              <textarea name="message" rows={4} placeholder="Tell us what you think..."></textarea>
            </div>
            <button className={styles.feedbackButton} type="submit">Send Feedback</button>
          </div>
        </form>


      </motion.section>
    </div>
  );
}
