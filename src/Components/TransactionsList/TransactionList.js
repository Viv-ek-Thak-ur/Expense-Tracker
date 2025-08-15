import React, { useState, useEffect, useRef } from "react";
import { FaArrowDown, FaArrowUp, FaEdit, FaTrash } from "react-icons/fa";
import styles from "./TransactionsList.module.css";

export default function TransactionsList({ transactions, onEdit, onDelete }) {
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Ref to keep track of previous transactions length
  const prevLengthRef = useRef(transactions.length);

  const totalPages = Math.max(Math.ceil(transactions.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = transactions.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Sync currentPage whenever transactions array changes
  useEffect(() => {
    // Flag: If currentPage exceeds totalPages (after deleting), go to last page
    if (currentPage > totalPages) setCurrentPage(totalPages);

    // Flag: If no transactions, reset to page 1
    if (transactions.length === 0) setCurrentPage(1);

    // ✅ NEW: Auto-jump to last page when new transaction is added
    if (transactions.length > prevLengthRef.current) {
      setCurrentPage(totalPages); 
    }

    // ✅ Update previous length for next comparison
    prevLengthRef.current = transactions.length;
  }, [transactions, totalPages, currentPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className={styles.container}>
      {transactions.length > 0 ? (
        <ul className={styles.list}>
          {currentItems.map((t) => (
            <li key={t.id} className={styles.item}>
              <div className={styles.left}>
                <div className={styles.icon}>
                  {t.type === "income" ? (
                    <FaArrowDown color="#16a34a" />
                  ) : (
                    <FaArrowUp color="#dc2626" />
                  )}
                </div>
                <div className={styles.text}>
                  <span className={styles.title}>{t.title}</span>
                  <span className={styles.date}>{t.date}</span>
                </div>
              </div>

              <div className={styles.right}>
                <span
                  className={`${styles.amount} ${
                    t.type === "income" ? styles.income : styles.expense
                  }`}
                >
                  ₹{t.amount}
                </span>
                <div className={styles.actions}>
                  <FaEdit className={styles.actionIcon} onClick={() => onEdit(t)} />
                  <FaTrash className={styles.actionIcon} onClick={() => onDelete(t.id)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No Transactions</p>
      )}

      <div className={styles.pagination}>
        <button onClick={handlePrev} disabled={currentPage === 1}>◀</button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>▶</button>
      </div>
    </div>
  );
}
