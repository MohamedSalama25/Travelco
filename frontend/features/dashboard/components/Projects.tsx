"use client"

import React, { useCallback, useMemo } from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import UniTable from "@/components/data-table"


export function formatStatus(status: string): string {
  if (!status) return ""

  const map: Record<string, string> = {
    "in progress": "In Progress",
    "submitted": "Submitted",
    "not started": "Not Started",
    "pending": "Pending",
    "done": "Done",
    "completed": "Completed",
  }

  const key = status.toLowerCase().trim()

  return map[key] ?? status
}


/** لو عايز تغيّر الـ type عشان يطابق مشروعك، عدّله هنا */
export type ProjectSummary = {
  id: number
  number: string
  name: string
  main_contractor: string
  location: string
  status: "In Progress" | "Submitted" | "Not Started" | string
}

/** Mock data ثابت */
const mockProjects: ProjectSummary[] = [
  {
    id: 1,
    number: "PJT-001",
    name: "Main Street Bridge",
    main_contractor: "ACME Constructions",
    location: "Cairo",
    status: "In Progress",
  },
  {
    id: 2,
    number: "PJT-002",
    name: "Riverfront Mall",
    main_contractor: "BuildRight Ltd.",
    location: "Alexandria",
    status: "Submitted",
  },
  {
    id: 3,
    number: "PJT-003",
    name: "Green Park Housing",
    main_contractor: "UrbanSpace",
    location: "Giza",
    status: "Not Started",
  },
  {
    id: 4,
    number: "PJT-004",
    name: "South Metro Line",
    main_contractor: "MetroBuild",
    location: "Cairo",
    status: "In Progress",
  },
  {
    id: 5,
    number: "PJT-005",
    name: "New Harbor Terminal",
    main_contractor: "HarborWorks",
    location: "Alexandria",
    status: "Submitted",
  },
  {
    id: 6,
    number: "PJT-001",
    name: "Main Street Bridge",
    main_contractor: "ACME Constructions",
    location: "Cairo",
    status: "In Progress",
  },
  {
    id: 7,
    number: "PJT-002",
    name: "Riverfront Mall",
    main_contractor: "BuildRight Ltd.",
    location: "Alexandria",
    status: "Submitted",
  },
  {
    id: 8,
    number: "PJT-003",
    name: "Green Park Housing",
    main_contractor: "UrbanSpace",
    location: "Giza",
    status: "Not Started",
  },
  {
    id: 9,
    number: "PJT-004",
    name: "South Metro Line",
    main_contractor: "MetroBuild",
    location: "Cairo",
    status: "In Progress",
  },
  {
    id: 10,
    number: "PJT-005",
    name: "New Harbor Terminal",
    main_contractor: "HarborWorks",
    location: "Alexandria",
    status: "Submitted",
  },
]

/** تعريف الأعمدة مع typing صحيح */
const columns: ColumnDef<ProjectSummary>[] = [
  {
    accessorKey: "number",
    header: " Number",
  },
  {
    accessorKey: "name",
    header: "Project Name",
  },
  {
    accessorKey: "main_contractor",
    header: "Contractor",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: Row<ProjectSummary> }) => {
      const status = String(row.getValue("status"))
      let className = ""

      switch (status) {
        case "In Progress":
          className = "bg-warning-10 text-warning"
          break
        case "Submitted":
          className = "bg-success-10 text-success"
          break
        case "Not Started":
          className = "bg-danger-10 text-danger"
          break
        default:
          className = ""
      }

      return <Badge variant="default" className={className}>{formatStatus(status)}</Badge>
    },
  },
]

/** الكومبوننت: ستاتيكي، يعرض الـ UniTable مع الـ mock data */
export default function HomeProjects() {
  const [page, setPage] = React.useState(1)
  const router = useRouter()
  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);
    },
    [setPage]
  );

  const userActions = useMemo(() => {
    const actions: {
      label: string | (() => string);
      classname?: string | (() => string);
      onClick: () => void;
    }[] = [];


    actions.push({
      label: "Delete",
      onClick: () => alert("Delete project"),
    });



    return actions;
  }, [

  ]);

  const handleRowClick = React.useCallback(
    (project: ProjectSummary) => {
      // لو مش عايز التنقل، ممكن تمسح السطر ده أو تعدّل الهدف
      router.push(`/projects/${project.id}`)
    },
    [router]
  )


  return (
    <section className="w-full">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">My Projects</h2>
      </header>

      <UniTable<ProjectSummary>
        columns={columns}
        data={mockProjects.slice((page - 1) * 5, page * 5)}
        totalItems={mockProjects.length}
        itemsPerPage={5}
        currentPage={page}
        tableName="Projects"
        actions={userActions}
        onPageChange={handlePageChange}
      />
    </section>
  )
}
