import "./App.css";
import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import DisplayCard from "./Components/MainDisplayCard/DisplayCard";
import PieChartDisplay from "./Components/ExpensePieChart/PieCart";
import BarGraph from "./Components/ExpenseBarGraph/BarGraph";
import TransactionsList from "./Components/TransactionsList/TransactionList";
import { useSnackbar } from 'notistack';


Modal.setAppElement("#root");

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingTransaction, setEditingTransaction] = useState(null);
  const { enqueueSnackbar } = useSnackbar();


  // const [balance, setBalance] = useState(() => {
  //   return parseFloat(localStorage.getItem("balance")) || 5000;
  // });
  // const [expense, setExpense] = useState(() => {
  //   return parseFloat(localStorage.getItem("expense")) || 0;                     (I changed architecture of app,if i dint change the arch then i had to make one more state that collected all transaction and it wouldhave impacted the performance of the app ,when I wanted the list of all the transaction that happened , or will happen)   omitted all this part for better architecture to provide stability and consistency for the app, by providing one truthy value i.e. transactions state , all the values used for the UI will be derived values from the transactions state
  // });
  //  const [categoryExpenses, setCategoryExpenses] = useState(() => {
  //   return JSON.parse(localStorage.getItem("categoryExpenses")) || {
  //     Food: 0,
  //     Travel: 0,
  //     Shopping: 0,
  //     Bills: 0
  //   };
  // });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [amount, setAmount] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  // useEffect(() => {
  //   const savedBalance = localStorage.getItem("balance");
  //   const savedExpense = localStorage.getItem("expense");
  //   if (savedBalance) setBalance(parseFloat(savedBalance));
  //   if (savedExpense) setExpense(parseFloat(savedExpense));
  // }, []); requred if lazy initialiser is not used and u use isloaded flag

  // useEffect(() => {
  //   localStorage.setItem("balance", balance);
  // }, [balance]);

  // useEffect(() => {
  //   localStorage.setItem("expense", expense);
  // }, [expense]);

  // useEffect(() => {
  //   localStorage.setItem("categoryExpenses", JSON.stringify(categoryExpenses));
  // }, [categoryExpenses]);

  // DERIVED VALUES

  const initialBalance = 5000;

  const balance = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    return initialBalance + income - expense;
  }, [transactions, initialBalance]);

  const expense = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }, [transactions]);

  // PERSIST VALUES ON CHANGE

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleOpenModal = (type) => {
    setIsModalOpen(true);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAmount(0);
    setCategory("");
    setDate("");
    setTitle("");
    setEditingTransaction(null);
  };

  const handleSubmit = () => {
  if (isNaN(amount) || amount <= 0) return;
  if (modalType === "expense" && (!title || !date || !category)) return;

   // Prevent expenses that exceed balance
  if (
    modalType === "expense" &&
    amount > balance
  ) {
    enqueueSnackbar("Expense exceeds wallet balance!", { variant: "error" });
    return; // stop submission
  }

  const transactionData = {
    id: editingTransaction ? editingTransaction.id : Date.now(), // reuse id if editing
    type: modalType,
    title: modalType === "income" ? "Income" : title,
    amount: parseFloat(amount) || 0,
    category: modalType === "expense" ? category : null,
    date: date || new Date().toISOString().slice(0, 10),
  };

  if (editingTransaction) {
    // Edit existing transaction
    setTransactions((prev) =>
      prev.map((t) => (t.id === editingTransaction.id ? transactionData : t))
    );
  } else {
    // Add new transaction
    setTransactions((prev) => [...prev, transactionData]);
  }

  handleCloseModal();
  
};

  // Transform categoryTotals for  chart
  const chartData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  return (
    <div className="App">
      <h1 style={{ color: "white" }}>Expense Tracker</h1>
      <div className="dashboard">
        <DisplayCard
          label="Wallet Balance"
          amount={balance}
          type="income"
          btnText="Add Income"
          onBtnClick={() => handleOpenModal("income")}
        />

        <DisplayCard
          label="Expenses"
          amount={expense}
          type="expense"
          btnText="Add Expense"
          onBtnClick={() => handleOpenModal("expense")}
        />
        
        
        <PieChartDisplay data={chartData} />
        
      </div>
      <div className="details-board">
        <div>
          <h3 className="heading">Recent Transactions</h3>
          <TransactionsList
            transactions={transactions}
            onEdit={(transaction) => {
              // Set the transaction to edit
              setEditingTransaction(transaction);

              // Pre-fill modal fields
              setModalType(transaction.type);
              setTitle(transaction.title);
              setAmount(transaction.amount);
              setCategory(transaction.category || "");
              setDate(transaction.date);

              // Open modal
              setIsModalOpen(true);
            }}
            onDelete={(id) => {
              setTransactions((prev) => prev.filter((t) => t.id !== id));
            }}
          />
        </div>
        <div>
          <h3 className="heading">Top Expenses</h3>
          <BarGraph data={chartData} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel={modalType === "income" ? "Add Balance" : "Add Expense"}
      >
        <h2>{modalType === "income" ? "Add Balance" : "Add Expenses"}</h2>

        {/* balance form */}
        {modalType === "income" && (
          <>
            <input
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            <button onClick={handleSubmit}>Add Balance</button>

            <button onClick={handleCloseModal}>Cancel</button>
          </>
        )}
        {/* expense form */}
        {modalType === "expense" && (
          <>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Price"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
            <input
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
            </select>
            <button onClick={handleSubmit}>Add Expense</button>
            <button onClick={handleCloseModal}>Cancel</button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;
