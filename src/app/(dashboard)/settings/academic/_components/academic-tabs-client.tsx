"use client"

import React, { useState } from "react"
import { BookOpen, Building, Calendar, GraduationCap } from "lucide-react"

import type { AcademicAdminData } from "@/lib/server/academic-admin-read-models"
import { AcademicYearsPanel } from "./academic-years-panel"
import { ClassroomsPanel } from "./classrooms-panel"
import { SubjectsPanel } from "./subjects-panel"
import { AssignmentsPanel } from "./assignments-panel"

type TabKey = "years" | "classrooms" | "subjects" | "assignments"

export function AcademicTabsClient({ data }: { data: AcademicAdminData }) {
  const [activeTab, setActiveTab] = useState<TabKey>("years")

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "years", label: "ปีการศึกษาและภาคเรียน", icon: Calendar, count: data.academicYears.length },
    { key: "classrooms", label: "ห้องเรียน", icon: Building, count: data.classrooms.length },
    { key: "subjects", label: "รายวิชา", icon: BookOpen, count: data.subjects.length },
    { key: "assignments", label: "มอบหมายครูผู้สอน", icon: GraduationCap, count: data.classroomSubjects.length },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Academic Management Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`group inline-flex items-center gap-2 border-b-2 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "years" && (
          <AcademicYearsPanel academicYears={data.academicYears} semesters={data.semesters} />
        )}
        {activeTab === "classrooms" && (
          <ClassroomsPanel
            academicYears={data.academicYears}
            classrooms={data.classrooms}
            teachers={data.teachers}
          />
        )}
        {activeTab === "subjects" && <SubjectsPanel subjects={data.subjects} />}
        {activeTab === "assignments" && (
          <AssignmentsPanel
            classrooms={data.classrooms}
            subjects={data.subjects}
            classroomSubjects={data.classroomSubjects}
            teachers={data.teachers}
            semesters={data.semesters}
          />
        )}
      </div>
    </div>
  )
}
