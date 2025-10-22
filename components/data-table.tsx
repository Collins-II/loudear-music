"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  type Row,
} from "@tanstack/react-table";
import { toast } from "sonner";
import Image from "next/image";
import { z } from "zod";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { cn, formatDatePretty, formatDuration } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Edit } from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { CSS } from "@dnd-kit/utilities";

// -------------------------
// Schema
// -------------------------
export const baseSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  artist: z.string(),
  title: z.string().min(2),
  cover: z.string().optional(),
  genre: z.string(),
  status: z.boolean().default(false),
  plays: z.number().optional(),
  downloads: z.number().optional(),
  duration: z.number().optional(),
  releaseDate: z.string().optional(),
  type: z.enum(["song", "album", "video"]),
  description: z.string().optional(),
});

export type BaseItem = z.infer<typeof baseSchema>;

// -------------------------
// Drag Handle
// -------------------------
function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <IconGripVertical className="size-4" />
    </Button>
  );
}

// -------------------------
// Edit Drawer
// -------------------------
function EditModalDrawer({
  open,
  onClose,
  item,
  type,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item: BaseItem | null;
  type: string;
  onSave: (data: Partial<BaseItem>) => void;
}) {
  const [formData, setFormData] = React.useState<Partial<BaseItem>>(item || {});
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (item) setFormData(item);
  }, [item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((p) => ({ ...p, cover: reader.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.title || formData.title.trim().length < 2)
      return toast.error("Title must be at least 2 characters.");
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card text-card-foreground border border-border">
        <DialogHeader>
          <DialogTitle>Edit {type}</DialogTitle>
          <DialogDescription>Update metadata and cover art.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-3">
            <Label>Title</Label>
            <Input
              value={formData.title ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="grid gap-3">
            <Label>Artist</Label>
            <Input
              value={formData.artist ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, artist: e.target.value }))}
            />
          </div>

          <div className="grid gap-3">
            <Label>Genre</Label>
            <Select
              value={formData.genre ?? ""}
              onValueChange={(v) => setFormData((p) => ({ ...p, genre: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {["pop", "hip-hop", "rnb", "gospel", "reggae", "jazz", "rock"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label>Description</Label>
            <Textarea
              value={formData.description ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Enter description..."
            />
          </div>

          <div className="grid gap-3">
            <Label>Status</Label>
            <Select
              value={formData.status ? "published" : "draft"}
              onValueChange={(v) => setFormData((p) => ({ ...p, status: v === "published" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cover */}
          <div className="flex flex-col gap-2">
            <Label>Cover</Label>
            <div className="flex items-center gap-3">
              {formData.cover ? (
                <div className="relative w-24 h-24">
                  <Image src={formData.cover} alt="cover" fill className="rounded object-cover" />
                  <button
                    aria-label="close-button"
                    onClick={() => setFormData((p) => ({ ...p, cover: undefined }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => document.getElementById("cover-upload")?.click()}>
                  <IconUpload size={16} className="mr-2" /> Upload
                </Button>
              )}
              <input id="cover-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -------------------------
// Draggable Row
// -------------------------
function DraggableRow({ row }: { row: Row<BaseItem> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id: row.original.id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("hover:bg-muted/20", isDragging && "opacity-60")}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

// -------------------------
// Main Table Component
// -------------------------
export function DataTable({
  type,
  initialData = [],
}: {
  type: "song" | "album" | "video";
  initialData?: BaseItem[];
}) {
  const [items, setItems] = React.useState<BaseItem[]>(initialData);
  const socket = React.useMemo(() => getSocket(), []);
  const [editItem, setEditItem] = React.useState<BaseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // pagination state is kept by react-table; use it when rendering controls
  // -------------------------
  // Socket setup — subscribe once
  // -------------------------
  React.useEffect(() => {
    if (!socket) return;
    const onConnect = () => console.log("🟢 Connected to socket server");
    const onUpdate = (payload: { type: string; data: BaseItem }) => {
      if (payload.type !== type) return;
      setItems((prev) => prev.map((i) => (i.id === payload.data.id ? payload.data : i)));
      toast.success(`${payload.data.title} updated`);
    };
    const onDelete = (payload: { type: string; id: string }) => {
      if (payload.type !== type) return;
      setItems((prev) => prev.filter((i) => i.id !== payload.id));
      toast.info(`Item deleted`);
    };
    const onCreate = (payload: { type: string; data: BaseItem }) => {
      if (payload.type !== type) return;
      setItems((prev) => [payload.data, ...prev]);
      toast.success(`${payload.data.title} added`);
    };

    socket.on("connect", onConnect);
    socket.on("media:update", onUpdate);
    socket.on("media:delete", onDelete);
    socket.on("media:create", onCreate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("media:update", onUpdate);
      socket.off("media:delete", onDelete);
      socket.off("media:create", onCreate);
      // do NOT disconnect global socket here — getSocket likely returns shared instance
    };
  }, [socket, type]);

  // -------------------------
  // API Mutations (call server; server will emit socket events)
  // -------------------------
  const updateItem = async (payload: Partial<BaseItem>) => {
  const hasFile = Object.values(payload).some(
    (v: any) => v instanceof File || v instanceof Blob
  );

  let res: Response;
  if (hasFile) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v as any);
    });
    res = await fetch(`/api/${type}s/upload`, { method: "PUT", body: fd });
  } else {
    res = await fetch(`/api/${type}s/upload`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update");
  }

  const updated = await res.json();

  // ✅ Optimistic UI update
  setItems((prev) =>
    prev.map((i) => (i.id === updated.id || i.itemId === updated._id ? { ...i, ...updated } : i))
  );

  toast.success(`${updated.title ?? "Item"} updated`);
};


 const deleteItem = React.useCallback(
  async (id: string) => {
    try {
      const res = await fetch(`/api/${type}s/upload?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete");
      }

      setItems((prev) => prev.filter((i) => i.id !== id && i.itemId !== id));
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
      throw err;
    }
  },
  [type] // dependency for type since the route depends on it
);
  // -------------------------
  // Columns (includes actions)
  // -------------------------
  const columns = React.useMemo<ColumnDef<BaseItem>[]>(() => [
    {
      id: "drag",
      header: "",
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.cover && (
            <Image
              src={row.original.cover}
              alt={row.original.title}
              width={40}
              height={40}
              className="rounded object-cover"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-xs text-muted-foreground capitalize">{row.original.type}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "artist",
      header: "Artist",
      cell: ({ row }) => <span>{row.original.artist}</span>,
    },
    {
      accessorKey: "genre",
      header: "Genre",
      cell: ({ row }) => <Badge variant="secondary">{row.original.genre}</Badge>,
    },
    {
      accessorKey: "plays",
      header: "Plays",
      cell: ({ row }) => <span>{row.original.plays ?? "—"}</span>,
    },
    {
      accessorKey: "downloads",
      header: "Downloads",
      cell: ({ row }) => <span>{row.original.downloads ?? "—"}</span>,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (row.original.duration ? formatDuration(row.original.duration) : "—"),
    },
    {
      accessorKey: "releaseDate",
      header: "Year",
      cell: ({ row }) => (row.original.releaseDate ? formatDatePretty(row.original.releaseDate) : "—"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.status ? "outline" : "secondary"}>{row.original.status ? "Published" : "Draft"}</Badge>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white text-slate-900 border-none">
            <DropdownMenuItem
              onClick={() => {
                setEditItem(row.original);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-between"
            >
              <span className="text-xs">Edit</span> <Edit className="text-lg" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                deleteItem(row.original.itemId).catch((err) => toast.error(err.message || "Delete failed"));
              }}
              className="flex items-center justify-between"
            >
              <span className="text-xs">Delete</span>
              <TrashIcon className="text-red-400 text-lg" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [ deleteItem ]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
      toast.success("Order updated");
      // optional: send order to server; server can then re-broadcast if needed
      // socket.emit('charts:update:item', { type, id: active.id, newPos: newIndex })
    }
  };

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // -------------------------
  // Render
  // -------------------------
  return (
    <>
      <Tabs defaultValue="data" className="w-full">
        <div className="flex justify-end items-center gap-2 mb-2">
          {/* Customize columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover:text-white">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white text-slate-900 border-none">
              {table
                .getAllColumns()
                .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="data">
          <div className="overflow-hidden rounded-lg border bg-card">
            <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={onDragEnd}>
              <Table>
                <TableHeader className="bg-muted/50">
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length ? (
                    <SortableContext items={table.getRowModel().rows.map((r) => r.original.id)} strategy={verticalListSortingStrategy}>
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center">
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination + row-per-page */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-muted-foreground hidden lg:flex text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-2">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                      <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                        <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 20, 30, 50].map((s) => (
                          <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                      <span className="sr-only">Go to first page</span>
                      <IconChevronsLeft />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                      <span className="sr-only">Previous</span>
                      <IconChevronLeft />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                      <span className="sr-only">Next</span>
                      <IconChevronRight />
                    </Button>
                    <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                      <span className="sr-only">Go to last page</span>
                      <IconChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </DndContext>
          </div>
        </TabsContent>
      </Tabs>

     <EditModalDrawer
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  item={editItem}
  type={type}
  onSave={(data) => {
    const payload: Partial<BaseItem> = { ...(editItem ?? {}), ...data };
    updateItem(payload)
      .then(() => {
        setIsModalOpen(false);
        setEditItem(null);
      })
      .catch((err) => toast.error(err.message || "Update failed"));
  }}
/>

    </>
  );
}
