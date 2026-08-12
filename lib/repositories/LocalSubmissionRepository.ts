"use client"

import { FormSubmission, SubmissionRepository } from "./types"

const SUBMISSIONS_STORAGE_KEY = "farmhand_submissions_v1"

export function generateSubmissionId(formId: string): string {
  const cleanFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_")
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  return `sub_${cleanFormId}_${timestamp}_${randomSuffix}`
}

export class LocalSubmissionRepository implements SubmissionRepository {
  private getStorage(): FormSubmission[] {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private setStorage(submissions: FormSubmission[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions))
    } catch (e) {
      console.error("Failed to save submission to localStorage:", e)
    }
  }

  async getAll(): Promise<FormSubmission[]> {
    const list = this.getStorage()
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getById(id: string): Promise<FormSubmission | null> {
    const list = this.getStorage()
    return list.find((sub) => sub.id === id) || null
  }

  async getByFormId(formId: string): Promise<FormSubmission[]> {
    const list = this.getStorage()
    return list
      .filter((sub) => sub.formId === formId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getDraftByFormId(formId: string): Promise<FormSubmission | null> {
    const list = this.getStorage()
    const drafts = list
      .filter((sub) => sub.formId === formId && sub.status === "draft")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return drafts[0] || null
  }

  async create(partial: Partial<FormSubmission>): Promise<FormSubmission> {
    const list = this.getStorage()
    const now = new Date().toISOString()
    const formId = partial.formId || "form_unknown"

    const newSubmission: FormSubmission = {
      id: partial.id || generateSubmissionId(formId),
      formId,
      formVersion: partial.formVersion || 1,
      status: partial.status || "draft",
      responses: partial.responses || {},
      createdAt: partial.createdAt || now,
      updatedAt: now,
      submittedAt: partial.status === "submitted" ? now : partial.submittedAt,
    }

    list.unshift(newSubmission)
    this.setStorage(list)
    return newSubmission
  }

  async update(submission: FormSubmission): Promise<FormSubmission> {
    const list = this.getStorage()
    const now = new Date().toISOString()

    const updatedSubmission: FormSubmission = {
      ...submission,
      updatedAt: now,
      submittedAt: submission.status === "submitted" && !submission.submittedAt ? now : submission.submittedAt,
    }

    const index = list.findIndex((sub) => sub.id === submission.id)
    if (index >= 0) {
      list[index] = updatedSubmission
    } else {
      list.unshift(updatedSubmission)
    }

    this.setStorage(list)
    return updatedSubmission
  }

  async delete(id: string): Promise<boolean> {
    const list = this.getStorage()
    const filtered = list.filter((sub) => sub.id !== id)
    const deleted = filtered.length < list.length
    if (deleted) {
      this.setStorage(filtered)
    }
    return deleted
  }
}

export const localSubmissionRepository = new LocalSubmissionRepository()
export default localSubmissionRepository
