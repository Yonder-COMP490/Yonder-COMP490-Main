import { createContext, useContext, useEffect, useState } from "react";
import Cost from "./Cost";

const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [budgetItems, setBudgetItems] = useState(() => {
    const saved = localStorage.getItem("budgetItems");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return parsed.map((item) => ({
      ...item,
      cost: new Cost(
        item.cost.lowerEnd,
        item.cost.upperEnd,
        item.cost.currency
      ),
    }));
  });

  useEffect(() => {
    localStorage.setItem(
      "budgetItems",
      JSON.stringify(budgetItems)
    );
  }, [budgetItems]);

  function addBudgetItem(name, cost, days) {
    setBudgetItems((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name,
        cost,
        days,
      },
    ]);
  }

  function removeBudgetItem(id) {
    setBudgetItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  return (
    <BudgetContext.Provider
      value={{
        budgetItems,
        addBudgetItem,
        removeBudgetItem,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}