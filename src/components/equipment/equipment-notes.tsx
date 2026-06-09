"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { EquipmentNote } from "@/lib/equipment"

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EquipmentNotes({
  notes,
  onAdd,
  onUpdate,
  onDelete,
}: {
  notes: EquipmentNote[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const submitDraft = () => {
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft("")
  }

  const startEdit = (note: EquipmentNote) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const saveEdit = () => {
    const text = editText.trim()
    if (editingId && text) onUpdate(editingId, text)
    setEditingId(null)
    setEditText("")
  }

  return (
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle className="text-sm">Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note about this item…"
            rows={2}
          />
          <Button size="sm" className="self-end" onClick={submitDraft} disabled={!draft.trim()}>
            <Plus data-icon="inline-start" />
            Add note
          </Button>
        </div>

        {notes.length === 0 ? (
          <Empty className="rounded-lg border border-dashed border-border py-6">
            <EmptyHeader>
              <EmptyTitle>No notes yet</EmptyTitle>
              <EmptyDescription>Keep maintenance logs, tuning tips, or reminders here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => {
              const isEditing = note.id === editingId
              const wasEdited = note.updatedAt !== note.createdAt
              return (
                <li key={note.id} className="rounded-lg border border-border p-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X data-icon="inline-start" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={!editText.trim()}>
                          <Check data-icon="inline-start" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-relaxed text-foreground">{note.text}</p>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => startEdit(note)}
                            aria-label="Edit note"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(note.id)}
                            aria-label="Delete note"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span>Created {formatTimestamp(note.createdAt)}</span>
                        {wasEdited && <span>Edited {formatTimestamp(note.updatedAt)}</span>}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
