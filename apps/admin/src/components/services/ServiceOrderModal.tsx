import { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUp, ArrowDown, GripVertical, Loader2 } from "lucide-react";
import type { ManagedService } from "@flyora/types";
import { apiClient, ApiError } from "../../lib/apiClient";
import { Modal, FormError } from "../ui/Modal";

export function ServiceOrderModal({
  services,
  onClose,
  onSaved,
}: {
  services: ManagedService[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [ids, setIds] = useState(services.map((s) => s.id));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const dirty = ids.some((id, index) => id !== services[index]?.id);
  const mutation = useMutation({
    mutationFn: () =>
      apiClient.put("/services/order", {
        serviceIds: ids,
        expectedServiceIds: services.map((s) => s.id),
      }),
  });
  const conflict =
    mutation.error instanceof ApiError && mutation.error.statusCode === 409;
  const move = (id: string, to: number) => {
    if (!mutation.isPending && !conflict)
      setIds((current) =>
        arrayMove(
          current,
          current.indexOf(id),
          Math.max(0, Math.min(current.length - 1, to)),
        ),
      );
  };
  const save = async () => {
    if (mutation.isPending || !dirty || conflict) return;
    setError("");
    try {
      await mutation.mutateAsync();
      await onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError && err.statusCode === 409
          ? "The service list has changed. Reload it before saving a new order."
          : "We couldn’t save the order. Please try again.",
      );
    }
  };
  const active = services.find((s) => s.id === activeId);
  return (
    <Modal
      title="Reorder services"
      description="Drag services into the order you want on the website."
      busy={mutation.isPending || !!activeId}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={mutation.isPending || !!activeId}
            className="rounded-lg border px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => void save()}
            disabled={!dirty || mutation.isPending || conflict || !!activeId}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {mutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {mutation.isPending ? "Saving…" : "Save order"}
          </button>
        </>
      }
    >
      {error && (
        <FormError>
          {error}
          {conflict && (
            <button
              className="ml-2 underline"
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: ["managed-services"],
                });
                onClose();
              }}
            >
              Reload services
            </button>
          )}
        </FormError>
      )}
      <DndContext
        sensors={sensors}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) =>
              `Picked up ${services.find((s) => s.id === active.id)?.name}. Use the arrow keys to move it.`,
            onDragOver: ({ active, over }) =>
              over
                ? `${services.find((s) => s.id === active.id)?.name}, position ${ids.indexOf(String(over.id)) + 1} of ${ids.length}.`
                : undefined,
            onDragEnd: ({ active, over }) =>
              over
                ? `${services.find((s) => s.id === active.id)?.name} moved to position ${ids.indexOf(String(over.id)) + 1} of ${ids.length}. Choose Save order to keep this change.`
                : "Move cancelled.",
            onDragCancel: () => "Move cancelled. The order has not changed.",
          },
        }}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={({ active, over }) => {
          setActiveId(null);
          if (over && active.id !== over.id)
            move(String(active.id), ids.indexOf(String(over.id)));
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2" aria-label="Service display order">
            {ids.map((id, index) => {
              const service = services.find((s) => s.id === id)!;
              return (
                <SortableService
                  key={id}
                  service={service}
                  index={index}
                  total={ids.length}
                  disabled={mutation.isPending || conflict}
                  move={move}
                />
              );
            })}
          </ol>
        </SortableContext>
        {createPortal(
          <DragOverlay dropAnimation={null}>
            {active ? (
              <div
                aria-hidden="true"
                className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-white p-4 text-sm shadow-lg"
              >
                <GripVertical size={18} />
                {active.name}
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </Modal>
  );
}
function SortableService({
  service,
  index,
  total,
  disabled,
  move,
}: {
  service: ManagedService;
  index: number;
  total: number;
  disabled: boolean;
  move: (id: string, to: number) => void;
}) {
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: service.id,
    disabled,
    transition: reduced ? null : { duration: 150, easing: "ease" },
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2 ${isDragging ? "opacity-30" : ""}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`Drag ${service.name}`}
        className="grid h-11 w-11 shrink-0 cursor-grab touch-none place-items-center rounded-md text-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 active:cursor-grabbing"
      >
        <GripVertical size={19} />
      </button>
      <span
        aria-hidden="true"
        className="w-5 shrink-0 text-center text-xs text-slate-400"
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">
          {service.name}
        </span>
        {!service.isActive && (
          <span className="text-xs text-slate-400">Paused</span>
        )}
      </div>
      <button
        type="button"
        aria-label={`Move ${service.name} up`}
        disabled={disabled || index === 0}
        onClick={() => move(service.id, index - 1)}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-25"
      >
        <ArrowUp size={16} />
      </button>
      <button
        type="button"
        aria-label={`Move ${service.name} down`}
        disabled={disabled || index === total - 1}
        onClick={() => move(service.id, index + 1)}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-25"
      >
        <ArrowDown size={16} />
      </button>
    </li>
  );
}
