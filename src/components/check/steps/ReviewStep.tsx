import { FormState } from "../types";

export default function ReviewStep({ form }: { form: FormState }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">6) Review + Submit</h2>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="font-medium">Region</dt>
          <dd>{form.region || "Not specified"}</dd>
        </div>
        <div>
          <dt className="font-medium">Product</dt>
          <dd>{form.product || "-"}</dd>
        </div>
        <div>
          <dt className="font-medium">Address</dt>
          <dd>
            {form.street}, {form.city}, {form.state} {form.zip}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Schedule</dt>
          <dd>
            {form.delivery_date} / {form.duration} / {form.urgency}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Material</dt>
          <dd>{form.material_type}</dd>
        </div>
        <div>
          <dt className="font-medium">Contact</dt>
          <dd>
            {form.name} - {form.phone}
            {form.email ? ` - ${form.email}` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}
