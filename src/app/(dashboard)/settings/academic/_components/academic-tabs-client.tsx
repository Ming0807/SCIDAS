"use client"

import React, { useState, useRef } from "react"
import { BookOpen, Building, Calendar, GraduationCap } from "lucide-react"

import type { AcademicAdminData } from "@/lib/server/academic-admin-read-models"
import { AcademicYearsPanel } from "./academic-years-panel"
import { ClassroomsPanel } from "./classrooms-panel"
import { SubjectsPanel } from "./subjects-panel"
import { AssignmentsPanel } from "./assignments-panel"

type TabKey = "years" | "classrooms" | "subjects" | "assignments"

export function AcademicTabsClient({ data }: { data: AcademicAdminData }) {
  const [activeTab, setActiveTab] = useState<TabKey>("years")
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    years: null,
    classrooms: null,
    subjects: null,
    assignments: null,
  })

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "years", label: "ปีการศึกษาและภาคเรียน", icon: Calendar, count: data.academicYears.length },
    { key: "classrooms", label: "ห้องเรียน", icon: Building, count: data.classrooms.length },
    { key: "subjects", label: "รายวิชา", icon: BookOpen, count: data.subjects.length },
    { key: "assignments", label: "มอบหมายครูผู้สอน", icon: GraduationCap, count: data.classroomSubjects.length },
  ]

  const handleKeyDown = (e: React.KeyboardEvent, currentKey: TabKey) => {
    const keys = tabs.map((t) => t.key)
    const currentIndex = keys.indexOf(currentKey)
    let nextIndex = currentIndex

    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % keys.length
      e.preventDefault()
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + keys.length) % keys.length
      e.preventDefault()
    } else if (e.key === "Home") {
      nextIndex = 0
      e.preventDefault()
    } else if (e.key === "End") {
      nextIndex = keys.length - 1
      e.preventDefault()
    }

    if (nextIndex !== currentIndex) {
      const nextKey = keys[nextIndex]
      setActiveTab(nextKey)
      tabRefs.current[nextKey]?.focus()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div
          role="tablist"
          aria-label="การจัดการโครงสร้างวิชาการ"
          className="-mb-px flex space-x-6 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[tab.key] = el
                }}
                id={`academic-tab-${tab.key}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`academic-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(e) => handleKeyDown(e, tab.key)}
                className={`group inline-flex items-center gap-2 border-b-2 py-3 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
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
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        <div
          id="academic-panel-years"
          role="tabpanel"
          aria-labelledby="academic-tab-years"
          tabIndex={0}
          hidden={activeTab !== "years"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          {activeTab === "years" && (
            <AcademicYearsPanel academicYears={data.academicYears} semesters={data.semesters} />
          )}
        </div>

        <div
          id="academic-panel-classrooms"
          role="tabpanel"
          aria-labelledby="academic-tab-classrooms"
          tabIndex={0}
          hidden={activeTab !== "classrooms"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          {activeTab === "classrooms" && (
            <ClassroomsPanel
              academicYears={data.academicYears}
              classrooms={data.classrooms}
              teachers={data.teachers}
            />
          )}
        </div>

        <div
          id="academic-panel-subjects"
          role="tabpanel"
          aria-labelledby="academic-tab-subjects"
          tabIndex={0}
          hidden={activeTab !== "subjects"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          {activeTab === "subjects" && <SubjectsPanel subjects={data.subjects} />}
        </div>

        <div
          id="academic-panel-assignments"
          role="tabpanel"
          aria-labelledby="academic-tab-assignments"
          tabIndex={0}
          hidden={activeTab !== "assignments"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
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
    </div>
  )
}
