import {
  Control,
  useFieldArray,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Utensils,
  Hotel,
} from "lucide-react";
import type { CreatePackageInput } from "@flyora/validators";

interface ItineraryBuilderProps {
  control: Control<CreatePackageInput>;
  register: UseFormRegister<CreatePackageInput>;
  errors: FieldErrors<CreatePackageInput>;
}

export const ItineraryBuilder = ({
  control,
  register,
  errors,
}: ItineraryBuilderProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "itinerary",
  });

  const handleAddDay = () => {
    append({
      day: fields.length + 1,
      title: "",
      description: "",
      meals: "Breakfast",
      stay: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 font-mono">
            Day-by-Day Itinerary Plan
          </h3>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            Define detailed schedules, meals, and accommodations for each day of
            the tour.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddDay}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Day {fields.length + 1}</span>
        </button>
      </div>

      {errors.itinerary?.root && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {errors.itinerary.root.message}
        </p>
      )}

      {fields.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-lg p-8 text-center bg-[#FAFAF9]">
          <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2 stroke-[1.2]" />
          <p className="text-xs text-zinc-700 font-medium">
            No itinerary days added
          </p>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5 mb-3">
            At least 1 day is required to publish this package.
          </p>
          <button
            type="button"
            onClick={handleAddDay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium shadow-xs hover:bg-zinc-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day 1</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const dayError = errors.itinerary?.[index];

            return (
              <div
                key={field.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs space-y-3 transition hover:border-zinc-300"
              >
                {/* Day Header & Controls */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-md bg-black text-white font-mono text-xs font-semibold flex items-center justify-center">
                      D{index + 1}
                    </span>
                    <span className="text-xs font-medium text-zinc-900">
                      Day {index + 1} Schedule
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="p-1 rounded text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-20 transition"
                      title="Move day up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="p-1 rounded text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-20 transition"
                      title="Move day down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete Day */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
                      title="Remove day"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day Title */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Day Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arrival in Dubai, Hotel Check-in & Dhow Cruise Dinner"
                    {...register(`itinerary.${index}.title` as const)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                  />
                  {dayError?.title && (
                    <p className="text-[11px] text-red-600 mt-1">
                      {dayError.title.message}
                    </p>
                  )}
                </div>

                {/* Day Description */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Activity Breakdown / Description{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe morning, afternoon, and evening sights, transfers, and activities..."
                    {...register(`itinerary.${index}.description` as const)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                  />
                  {dayError?.description && (
                    <p className="text-[11px] text-red-600 mt-1">
                      {dayError.description.message}
                    </p>
                  )}
                </div>

                {/* Meals & Stay Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1">
                      <Utensils className="w-3 h-3 text-zinc-400" />
                      <span>Meals Included (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Breakfast & Dinner"
                      {...register(`itinerary.${index}.meals` as const)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1">
                      <Hotel className="w-3 h-3 text-zinc-400" />
                      <span>Overnight Accommodation (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Radisson Blu Waterfront 5*"
                      {...register(`itinerary.${index}.stay` as const)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                    />
                  </div>
                </div>

                {/* Hidden day number input to keep order synced */}
                <input
                  type="hidden"
                  value={index + 1}
                  {...register(`itinerary.${index}.day` as const, {
                    valueAsNumber: true,
                  })}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
