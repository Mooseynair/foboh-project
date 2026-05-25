"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Adjustment } from "@/lib/types";

export type ProductScope = "one" | "multiple" | "all";

export type ProfileFormState = {
  name: string;
  description: string;
  basicCompleted: boolean;
  scope: ProductScope;
  selectedProductIds: string[];
  basedOn: "globalWholesale";
  adjustment: Adjustment;
  productsCompleted: boolean;
  selectedCustomerIds: string[];
  selectedCustomerGroupIds: string[];
  customersCompleted: boolean;
};

type Action =
  | { type: "setBasic"; name: string; description: string }
  | { type: "markBasicCompleted"; completed: boolean }
  | { type: "setScope"; scope: ProductScope }
  | { type: "toggleProduct"; id: string }
  | { type: "setProducts"; ids: string[] }
  | { type: "clearProducts" }
  | { type: "setAdjustment"; adjustment: Adjustment }
  | { type: "markProductsCompleted"; completed: boolean }
  | { type: "toggleCustomer"; id: string }
  | { type: "toggleCustomerGroup"; id: string }
  | { type: "markCustomersCompleted"; completed: boolean };

const initialState: ProfileFormState = {
  name: "",
  description: "",
  basicCompleted: false,
  scope: "multiple",
  selectedProductIds: [],
  basedOn: "globalWholesale",
  adjustment: {
    mode: "fixed",
    direction: "decrease",
    amount: 5,
  },
  productsCompleted: false,
  selectedCustomerIds: [],
  selectedCustomerGroupIds: [],
  customersCompleted: false,
};

function reducer(state: ProfileFormState, action: Action): ProfileFormState {
  switch (action.type) {
    case "setBasic":
      return { ...state, name: action.name, description: action.description };
    case "markBasicCompleted":
      return { ...state, basicCompleted: action.completed };
    case "setScope":
      return { ...state, scope: action.scope };
    case "toggleProduct": {
      const set = new Set(state.selectedProductIds);
      if (set.has(action.id)) set.delete(action.id);
      else set.add(action.id);
      return { ...state, selectedProductIds: Array.from(set) };
    }
    case "setProducts":
      return { ...state, selectedProductIds: action.ids };
    case "clearProducts":
      return { ...state, selectedProductIds: [] };
    case "setAdjustment":
      return { ...state, adjustment: action.adjustment };
    case "markProductsCompleted":
      return { ...state, productsCompleted: action.completed };
    case "toggleCustomer": {
      const set = new Set(state.selectedCustomerIds);
      if (set.has(action.id)) set.delete(action.id);
      else set.add(action.id);
      return { ...state, selectedCustomerIds: Array.from(set) };
    }
    case "toggleCustomerGroup": {
      const set = new Set(state.selectedCustomerGroupIds);
      if (set.has(action.id)) set.delete(action.id);
      else set.add(action.id);
      return { ...state, selectedCustomerGroupIds: Array.from(set) };
    }
    case "markCustomersCompleted":
      return { ...state, customersCompleted: action.completed };
    default:
      return state;
  }
}

type Ctx = {
  state: ProfileFormState;
  dispatch: React.Dispatch<Action>;
};

const ProfileFormContext = createContext<Ctx | null>(null);

export function ProfileFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <ProfileFormContext.Provider value={value}>
      {children}
    </ProfileFormContext.Provider>
  );
}

export function useProfileForm() {
  const ctx = useContext(ProfileFormContext);
  if (!ctx) throw new Error("useProfileForm must be used within ProfileFormProvider");
  return ctx;
}

export function useProfileFormActions() {
  const { dispatch } = useProfileForm();
  return useMemo(
    () => ({
      setBasic: (name: string, description: string) =>
        dispatch({ type: "setBasic", name, description }),
      markBasicCompleted: (completed: boolean) =>
        dispatch({ type: "markBasicCompleted", completed }),
      setScope: (scope: ProductScope) => dispatch({ type: "setScope", scope }),
      toggleProduct: (id: string) => dispatch({ type: "toggleProduct", id }),
      setProducts: (ids: string[]) => dispatch({ type: "setProducts", ids }),
      clearProducts: () => dispatch({ type: "clearProducts" }),
      setAdjustment: (adjustment: Adjustment) =>
        dispatch({ type: "setAdjustment", adjustment }),
      markProductsCompleted: (completed: boolean) =>
        dispatch({ type: "markProductsCompleted", completed }),
      toggleCustomer: (id: string) => dispatch({ type: "toggleCustomer", id }),
      toggleCustomerGroup: (id: string) =>
        dispatch({ type: "toggleCustomerGroup", id }),
      markCustomersCompleted: (completed: boolean) =>
        dispatch({ type: "markCustomersCompleted", completed }),
    }),
    [dispatch],
  );
}

export function useSaveProfile() {
  const { state } = useProfileForm();
  return useCallback(async () => {
    const body = {
      name: state.name || "Untitled profile",
      description: state.description || undefined,
      basedOn: state.basedOn,
      productIds: state.selectedProductIds,
      adjustment: state.adjustment,
      customerIds: state.selectedCustomerIds,
      customerGroupIds: state.selectedCustomerGroupIds,
    };
    const res = await fetch("/api/pricing-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `save failed (${res.status})`);
    }
    return (await res.json()) as { profile: { id: string } };
  }, [state]);
}
