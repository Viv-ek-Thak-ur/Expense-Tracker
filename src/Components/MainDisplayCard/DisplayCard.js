import React from "react";
import styles from "./displayCard.module.css";

export default function DisplayCard({ label, amount, type, btnText, onBtnClick }) {
  return (
    <div className={styles.card}>
      {/* Label */}
      <span className={styles.label}>{label}</span>

      {/* Amount */}
      <span
        className={`${styles.amount} ${
          type === "income" ? styles.income : styles.expense
        }`}
      >
        ₹{amount}
      </span>

      {/* Button */}
      <button
        className={`${styles.button} ${
          type === "income" ? styles.incomeBtn : styles.expenseBtn
        }`}
        onClick={onBtnClick}
      >
        {btnText}
      </button>
    </div>
  );
}
