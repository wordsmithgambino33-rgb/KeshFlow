
"use client";

import * as React from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config"; // adjust path if needed

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
}

interface User {
  uid: string;
  name: string;
  email?: string;
}

interface BudgetState {
  user: User | null;
  transactions: Transaction[];
  categories: string[];
  goals: Goal[];
}

type Action =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "EDIT_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "EDIT_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_CATEGORY"; payload: string }
  | { type: "LOAD_STATE"; payload: BudgetState };

const initialState: BudgetState = {
  user: null,
  transactions: [],
  categories: ["Food", "Rent", "Transport", "Entertainment", "Salary", "Other"],
  goals: [],
};

function reducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...initialState };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.payload] };
    case "EDIT_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] };
    case "EDIT_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}

export const BudgetContext = React.createContext<{
  state: BudgetState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // 🔹 Load user data from Firestore when user logs in
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!state.user) return;

      try {
        const docRef = doc(db, "users", state.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as BudgetState;

          // Convert string dates back to Date objects
          data.transactions = data.transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
          }));
          data.goals = data.goals.map((g: any) => ({
            ...g,
            deadline: new Date(g.deadline),
          }));

          dispatch({ type: "LOAD_STATE", payload: data });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    fetchUserData();
  }, [state.user]);

  // 🔹 Save data to Firestore whenever it changes
  React.useEffect(() => {
    const saveToFirestore = async () => {
      if (!state.user) return;

      try {
        const docRef = doc(db, "users", state.user.uid);

        const dataToSave = {
          ...state,
          transactions: state.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
          })),
          goals: state.goals.map((g) => ({
            ...g,
            deadline: g.deadline.toISOString(),
          })),
        };

        await setDoc(docRef, dataToSave, { merge: true });
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    };

    saveToFirestore();
  }, [state]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return React.useContext(BudgetContext);
}


export default initialState;
