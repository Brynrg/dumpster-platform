export type Product =
  | "dump_trailer"
  | "dumpster_20"
  | "dumpster_30"
  | "not_sure"
  | "";
export type Duration = "1-3_days" | "4-7_days" | "8+_days" | "";
export type Urgency = "asap" | "this_week" | "flexible" | "";
export type MaterialType =
  | "household_junk"
  | "construction_debris"
  | "yard_waste"
  | "roofing"
  | "mixed"
  | "";

export type FormState = {
  region: string;
  product: Product;
  street: string;
  city: string;
  state: string;
  zip: string;
  delivery_date: string;
  duration: Duration;
  urgency: Urgency;
  material_type: MaterialType;
  notes: string;
  name: string;
  phone: string;
  email: string;
  sms_opt_in: boolean;
};

export interface StepProps {
  form: FormState;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  errors: Record<string, string>;
}
