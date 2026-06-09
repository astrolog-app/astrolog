"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Telescope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { EquipmentDialog } from "@/components/equipment/equipment-dialog"
import { EquipmentAnalytics } from "@/components/equipment/equipment-analytics"
import {
  CATEGORIES,
  INITIAL_EQUIPMENT,
  INITIAL_NOTES,
  getCategory,
  type CategoryId,
  type EquipmentItem,
  type EquipmentNote,
} from "@/lib/equipment"

export function EquipmentView() {
  const [items, setItems] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT)
  const [notesByItem, setNotesByItem] = useState<Record<string, EquipmentNote[]>>(INITIAL_NOTES)
  const [activeTab, setActiveTab] = useState<CategoryId>("telescopes")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EquipmentItem | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>("t1")

  const category = getCategory(activeTab)

  const itemsByCategory = useMemo(() => {
    const map = new Map<CategoryId, EquipmentItem[]>()
    for (const c of CATEGORIES) map.set(c.id, [])
    for (const it of items) map.get(it.category)?.push(it)
    return map
  }, [items])

  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId])
  const selectedNotes = selectedId ? (notesByItem[selectedId] ?? []) : []

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (item: EquipmentItem) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const handleSave = (item: EquipmentItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id)
      return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [...prev, item]
    })
    setSelectedId(item.id)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
    setNotesByItem((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setSelectedId((cur) => (cur === id ? null : cur))
  }

  const addNote = (text: string) => {
    if (!selectedId) return
    const now = new Date().toISOString()
    const note: EquipmentNote = { id: crypto.randomUUID(), text, createdAt: now, updatedAt: now }
    setNotesByItem((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), note] }))
  }

  const updateNote = (noteId: string, text: string) => {
    if (!selectedId) return
    const now = new Date().toISOString()
    setNotesByItem((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).map((n) =>
        n.id === noteId ? { ...n, text, updatedAt: now } : n,
      ),
    }))
  }

  const deleteNote = (noteId: string) => {
    if (!selectedId) return
    setNotesByItem((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).filter((n) => n.id !== noteId),
    }))
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Equipment</h1>
          <p className="text-sm text-muted-foreground">Manage your telescopes, cameras, mounts and accessories.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus data-icon="inline-start" />
          Add {category.noun}
        </Button>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as CategoryId)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.label}
              <Badge variant="secondary" className="ml-1.5 tabular-nums">
                {itemsByCategory.get(c.id)?.length ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => {
          const list = itemsByCategory.get(c.id) ?? []
          return (
            <TabsContent key={c.id} value={c.id} className="mt-4 min-h-0 flex-1">
              {list.length === 0 ? (
                <Empty className="h-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Telescope />
                    </EmptyMedia>
                    <EmptyTitle>No {c.label.toLowerCase()} yet</EmptyTitle>
                    <EmptyDescription>Add your first {c.noun.toLowerCase()} to start tracking it.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={openAdd}>
                      <Plus data-icon="inline-start" />
                      Add {c.noun}
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div className="min-h-0 overflow-auto p-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {list.map((item) => {
                        const isSelected = item.id === selectedId
                        return (
                          <Card
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedId(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setSelectedId(item.id)
                              }
                            }}
                            className={cn(
                              "group cursor-pointer transition-colors hover:border-primary/50",
                              isSelected && "border-primary ring-1 ring-primary",
                            )}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <CardTitle className="truncate">{item.name}</CardTitle>
                                  <CardDescription className="truncate">{item.brand || "—"}</CardDescription>
                                </div>
                                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openEdit(item)
                                    }}
                                    aria-label={`Edit ${item.name}`}
                                  >
                                    <Pencil />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(item.id)
                                    }}
                                    aria-label={`Delete ${item.name}`}
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <dl className="flex flex-col gap-1.5 text-sm">
                                {c.fields.map((f) => {
                                  const value = item[f.key]
                                  if (value === undefined || value === "") return null
                                  return (
                                    <div key={f.key} className="flex items-center justify-between gap-2">
                                      <dt className="text-muted-foreground">{f.label}</dt>
                                      <dd className="font-medium tabular-nums text-foreground">
                                        {value}
                                        {f.unit ? ` ${f.unit}` : ""}
                                      </dd>
                                    </div>
                                  )
                                })}
                              </dl>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                  <div className="hidden h-full min-h-0 lg:block">
                    <EquipmentAnalytics
                      item={selected}
                      notes={selectedNotes}
                      onAddNote={addNote}
                      onUpdateNote={updateNote}
                      onDeleteNote={deleteNote}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={category}
        item={editing}
        onSave={handleSave}
      />
    </div>
  )
}
