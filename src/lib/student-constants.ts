export const validFamilyStatuses = new Set([
  "together",
  "separated",
  "single_parent",
  "orphan",
  "guardian",
  "other",
])

export const familyStatusLabels: Record<string, string> = {
  together: "อยู่พร้อมหน้า",
  separated: "บิดา/มารดาแยกกันอยู่",
  single_parent: "พ่อหรือแม่เลี้ยงเดี่ยว",
  orphan: "กำพร้า",
  guardian: "อยู่กับญาติ/ผู้อุปการะ",
  other: "อื่นๆ",
}

export const familyStatusOptions: Array<{ value: string; label: string }> = [
  { value: "together", label: "อยู่พร้อมหน้า" },
  { value: "separated", label: "บิดา/มารดาแยกกันอยู่" },
  { value: "single_parent", label: "พ่อหรือแม่เลี้ยงเดี่ยว" },
  { value: "orphan", label: "กำพร้า" },
  { value: "guardian", label: "อยู่กับญาติ/ผู้อุปการะ" },
  { value: "other", label: "อื่นๆ" },
]
