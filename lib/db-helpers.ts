import db from "./db"
import type { Form, FormField, Response, ResponseAnswer, FormWithFields, ResponseWithAnswers } from "./types"

// Generate unique ID
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Forms
export function createForm(userId: string, title: string, description?: string): Form {
  const id = generateId("form")
  const now = Math.floor(Date.now() / 1000)

  const stmt = db.prepare(`
    INSERT INTO forms (id, user_id, title, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, userId, title, description || null, now, now)

  return getForm(id)!
}

export function getForm(formId: string): Form | null {
  const stmt = db.prepare("SELECT * FROM forms WHERE id = ?")
  const row = stmt.get(formId) as any

  if (!row) return null

  return {
    ...row,
    settings: JSON.parse(row.settings),
  }
}

export function getFormWithFields(formId: string): FormWithFields | null {
  const form = getForm(formId)
  if (!form) return null

  const fields = getFormFields(formId)

  return { ...form, fields }
}

export function getUserForms(userId: string): Form[] {
  const stmt = db.prepare("SELECT * FROM forms WHERE user_id = ? ORDER BY updated_at DESC")
  const rows = stmt.all(userId) as any[]

  return rows.map((row) => ({
    ...row,
    settings: JSON.parse(row.settings),
  }))
}

export function updateForm(
  formId: string,
  updates: Partial<Pick<Form, "title" | "description" | "settings" | "status">>,
): void {
  const now = Math.floor(Date.now() / 1000)
  const fields = []
  const values = []

  if (updates.title !== undefined) {
    fields.push("title = ?")
    values.push(updates.title)
  }
  if (updates.description !== undefined) {
    fields.push("description = ?")
    values.push(updates.description)
  }
  if (updates.settings !== undefined) {
    fields.push("settings = ?")
    values.push(JSON.stringify(updates.settings))
  }
  if (updates.status !== undefined) {
    fields.push("status = ?")
    values.push(updates.status)
    if (updates.status === "published") {
      fields.push("published_at = ?")
      values.push(now)
    }
  }

  fields.push("updated_at = ?")
  values.push(now)
  values.push(formId)

  const stmt = db.prepare(`UPDATE forms SET ${fields.join(", ")} WHERE id = ?`)
  stmt.run(...values)
}

export function deleteForm(formId: string): void {
  const stmt = db.prepare("DELETE FROM forms WHERE id = ?")
  stmt.run(formId)
}

// Form Fields
export function createFormField(field: Omit<FormField, "id" | "created_at">): FormField {
  const id = generateId("field")
  const now = Math.floor(Date.now() / 1000)

  const stmt = db.prepare(`
    INSERT INTO form_fields (id, form_id, type, label, description, placeholder, options, validation, position, settings, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    field.form_id,
    field.type,
    field.label,
    field.description || null,
    field.placeholder || null,
    field.options ? JSON.stringify(field.options) : null,
    JSON.stringify(field.validation),
    field.position,
    JSON.stringify(field.settings),
    now,
  )

  return getFormField(id)!
}

export function getFormField(fieldId: string): FormField | null {
  const stmt = db.prepare("SELECT * FROM form_fields WHERE id = ?")
  const row = stmt.get(fieldId) as any

  if (!row) return null

  return {
    ...row,
    options: row.options ? JSON.parse(row.options) : null,
    validation: JSON.parse(row.validation),
    settings: JSON.parse(row.settings),
  }
}

export function getFormFields(formId: string): FormField[] {
  const stmt = db.prepare("SELECT * FROM form_fields WHERE form_id = ? ORDER BY position")
  const rows = stmt.all(formId) as any[]

  return rows.map((row) => ({
    ...row,
    options: row.options ? JSON.parse(row.options) : null,
    validation: JSON.parse(row.validation),
    settings: JSON.parse(row.settings),
  }))
}

export function updateFormField(
  fieldId: string,
  updates: Partial<Omit<FormField, "id" | "form_id" | "created_at">>,
): void {
  const fields = []
  const values = []

  if (updates.type !== undefined) {
    fields.push("type = ?")
    values.push(updates.type)
  }
  if (updates.label !== undefined) {
    fields.push("label = ?")
    values.push(updates.label)
  }
  if (updates.description !== undefined) {
    fields.push("description = ?")
    values.push(updates.description)
  }
  if (updates.placeholder !== undefined) {
    fields.push("placeholder = ?")
    values.push(updates.placeholder)
  }
  if (updates.options !== undefined) {
    fields.push("options = ?")
    values.push(updates.options ? JSON.stringify(updates.options) : null)
  }
  if (updates.validation !== undefined) {
    fields.push("validation = ?")
    values.push(JSON.stringify(updates.validation))
  }
  if (updates.position !== undefined) {
    fields.push("position = ?")
    values.push(updates.position)
  }
  if (updates.settings !== undefined) {
    fields.push("settings = ?")
    values.push(JSON.stringify(updates.settings))
  }

  values.push(fieldId)

  const stmt = db.prepare(`UPDATE form_fields SET ${fields.join(", ")} WHERE id = ?`)
  stmt.run(...values)
}

export function deleteFormField(fieldId: string): void {
  const stmt = db.prepare("DELETE FROM form_fields WHERE id = ?")
  stmt.run(fieldId)
}

// Responses
export function createResponse(data: Omit<Response, "id" | "created_at">): string {
  const id = generateId("resp")
  const now = Math.floor(Date.now() / 1000)

  const stmt = db.prepare(`
    INSERT INTO responses (
      id, form_id, user_fingerprint, ip_address, user_agent,
      country, city, device_type, referrer, completed, completion_time, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    data.form_id,
    data.user_fingerprint || null,
    data.ip_address || null,
    data.user_agent || null,
    data.country || null,
    data.city || null,
    data.device_type || null,
    data.referrer || null,
    data.completed ? 1 : 0,
    data.completion_time || null,
    now,
  )

  // Increment form response count if completed
  if (data.completed) {
    db.prepare("UPDATE forms SET response_count = response_count + 1 WHERE id = ?").run(data.form_id)
  }

  return id
}

export function createResponseAnswer(responseId: string, fieldId: string, value: any): void {
  const id = generateId("ans")
  const now = Math.floor(Date.now() / 1000)

  const stmt = db.prepare(`
    INSERT INTO response_answers (id, response_id, field_id, value, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)

  stmt.run(id, responseId, fieldId, JSON.stringify(value), now)
}

export function getFormResponses(formId: string, limit = 100): ResponseWithAnswers[] {
  const stmt = db.prepare(`
    SELECT * FROM responses
    WHERE form_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `)
  const rows = stmt.all(formId, limit) as any[]

  return rows.map((row) => {
    const answers = getResponseAnswers(row.id)
    return {
      ...row,
      completed: Boolean(row.completed),
      answers,
    }
  })
}

export function getResponseAnswers(responseId: string): ResponseAnswer[] {
  const stmt = db.prepare("SELECT * FROM response_answers WHERE response_id = ?")
  const rows = stmt.all(responseId) as any[]

  return rows.map((row) => ({
    ...row,
    value: JSON.parse(row.value),
  }))
}

// Analytics
export function trackAnalyticsEvent(
  formId: string,
  eventType: string,
  responseId?: string,
  fieldId?: string,
  metadata?: Record<string, any>,
): void {
  const id = generateId("evt")
  const now = Math.floor(Date.now() / 1000)

  const stmt = db.prepare(`
    INSERT INTO analytics_events (id, form_id, response_id, event_type, field_id, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, formId, responseId || null, eventType, fieldId || null, metadata ? JSON.stringify(metadata) : null, now)
}

export function getFormAnalytics(formId: string, days = 30) {
  const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60

  // Event counts by type
  const eventCounts = db
    .prepare(
      `
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    WHERE form_id = ? AND created_at >= ?
    GROUP BY event_type
  `,
    )
    .all(formId, since) as any[]

  // Responses by day
  const responsesByDay = db
    .prepare(
      `
    SELECT date(created_at, 'unixepoch') as date, COUNT(*) as count
    FROM responses
    WHERE form_id = ? AND created_at >= ?
    GROUP BY date
    ORDER BY date
  `,
    )
    .all(formId, since) as any[]

  // Device breakdown
  const deviceBreakdown = db
    .prepare(
      `
    SELECT device_type, COUNT(*) as count
    FROM responses
    WHERE form_id = ? AND created_at >= ?
    GROUP BY device_type
  `,
    )
    .all(formId, since) as any[]

  // Country breakdown
  const countryBreakdown = db
    .prepare(
      `
    SELECT country, COUNT(*) as count
    FROM responses
    WHERE form_id = ? AND created_at >= ? AND country IS NOT NULL
    GROUP BY country
    ORDER BY count DESC
    LIMIT 10
  `,
    )
    .all(formId, since) as any[]

  return {
    eventCounts,
    responsesByDay,
    deviceBreakdown,
    countryBreakdown,
  }
}
