"use client";

import { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import UniTable from "@/components/data-table";
import TableFilterBar, { TableFilters } from "@/components/globalComponents/tableFilterBar";
import { useTranslations } from "next-intl";

export interface Traveler {
    id: string;
    name: string;
    email: string;
    phone: string;
    tripCount: number;
    lastTripDate: string;
    status: "active" | "inactive" | "pending";
    totalSpent: number;
    joinDate: string;
    isArchived?: boolean;
}

// Mock Data
const mockTravelers: Traveler[] = [
    {
        id: "1",
        name: "أحمد محمد",
        email: "ahmed@example.com",
        phone: "+20 123 456 7890",
        tripCount: 12,
        lastTripDate: "2024-11-15",
        status: "active",
        totalSpent: 15420,
        joinDate: "2023-01-15",
    },
    {
        id: "2",
        name: "Sara Johnson",
        email: "sara.j@example.com",
        phone: "+1 555 123 4567",
        tripCount: 8,
        lastTripDate: "2024-10-28",
        status: "active",
        totalSpent: 9850,
        joinDate: "2023-03-22",
    },
    {
        id: "3",
        name: "محمود علي",
        email: "mahmoud@example.com",
        phone: "+20 111 222 3333",
        tripCount: 5,
        lastTripDate: "2024-09-10",
        status: "inactive",
        totalSpent: 6200,
        joinDate: "2023-06-10",
    },
    {
        id: "4",
        name: "Emily Chen",
        email: "emily.chen@example.com",
        phone: "+86 138 0000 1234",
        tripCount: 15,
        lastTripDate: "2024-11-20",
        status: "active",
        totalSpent: 22100,
        joinDate: "2022-11-05",
    },
    {
        id: "5",
        name: "فاطمة حسن",
        email: "fatima@example.com",
        phone: "+20 100 555 6666",
        tripCount: 3,
        lastTripDate: "2024-08-15",
        status: "pending",
        totalSpent: 4500,
        joinDate: "2024-05-20",
    },
    {
        id: "6",
        name: "David Smith",
        email: "david.s@example.com",
        phone: "+44 7700 900123",
        tripCount: 20,
        lastTripDate: "2024-11-25",
        status: "active",
        totalSpent: 31200,
        joinDate: "2022-08-12",
    },
    {
        id: "7",
        name: "ليلى عبدالله",
        email: "layla@example.com",
        phone: "+966 50 123 4567",
        tripCount: 7,
        lastTripDate: "2024-10-05",
        status: "active",
        totalSpent: 8900,
        joinDate: "2023-09-18",
    },
    {
        id: "8",
        name: "Michael Brown",
        email: "michael.b@example.com",
        phone: "+1 555 987 6543",
        tripCount: 2,
        lastTripDate: "2024-07-22",
        status: "inactive",
        totalSpent: 2800,
        joinDate: "2024-04-10",
    },
    {
        id: "9",
        name: "نور الدين",
        email: "nour@example.com",
        phone: "+971 50 999 8888",
        tripCount: 11,
        lastTripDate: "2024-11-18",
        status: "active",
        totalSpent: 14300,
        joinDate: "2023-02-28",
    },
    {
        id: "10",
        name: "Sophie Martin",
        email: "sophie.m@example.com",
        phone: "+33 6 12 34 56 78",
        tripCount: 6,
        lastTripDate: "2024-09-30",
        status: "pending",
        totalSpent: 7100,
        joinDate: "2023-12-05",
    },
];

export default function TravelersTable() {
    const t = useTranslations("table");
    const tTravelers = useTranslations("travelers");

    const [travelers, setTravelers] = useState<Traveler[]>(mockTravelers);
    const [archivedTravelers, setArchivedTravelers] = useState<Traveler[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<TableFilters>({
        search: "",
        name: "",
        dateFrom: "",
        dateTo: "",
        status: "all",
    });

    const statusOptions = [
        { value: "active", label: tTravelers("active") },
        { value: "inactive", label: tTravelers("inactive") },
        { value: "pending", label: tTravelers("pending") },
    ];

    // Filter logic
    const filteredTravelers = useMemo(() => {
        return (showArchived ? archivedTravelers : travelers).filter((traveler) => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    traveler.name.toLowerCase().includes(searchLower) ||
                    traveler.email.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Name filter
            if (filters.name) {
                const nameLower = filters.name.toLowerCase();
                if (!traveler.name.toLowerCase().includes(nameLower)) return false;
            }

            // Date range filter
            if (filters.dateFrom && traveler.lastTripDate < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && traveler.lastTripDate > filters.dateTo) {
                return false;
            }

            // Status filter
            if (filters.status && filters.status !== "all") {
                if (traveler.status !== filters.status) return false;
            }

            return true;
        });
    }, [travelers, archivedTravelers, showArchived, filters]);

    const handleClearFilters = () => {
        setFilters({
            search: "",
            name: "",
            dateFrom: "",
            dateTo: "",
            status: "all",
        });
    };

    const handleEdit = useCallback((traveler: Traveler) => {
        // TODO: Implement edit functionality
        console.log("Edit traveler:", traveler);
        alert(`Edit: ${traveler.name}`);
    }, []);

    const handleDelete = useCallback((traveler: Traveler) => {
        if (showArchived) {
            // Permanent delete from archive
            if (confirm(t("confirmPermanentDelete"))) {
                setArchivedTravelers((prev) => prev.filter((t) => t.id !== traveler.id));
            }
        } else {
            // Move to archive (soft delete)
            if (confirm(t("confirmDelete"))) {
                setTravelers((prev) => prev.filter((t) => t.id !== traveler.id));
                setArchivedTravelers((prev) => [
                    ...prev,
                    { ...traveler, isArchived: true },
                ]);
            }
        }
    }, [showArchived, t]);

    const handleRestore = useCallback((traveler: Traveler) => {
        setArchivedTravelers((prev) => prev.filter((t) => t.id !== traveler.id));
        setTravelers((prev) => [
            ...prev,
            { ...traveler, isArchived: false },
        ]);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Define columns
    const columns: ColumnDef<Traveler>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: tTravelers("name"),
        },
        {
            accessorKey: "email",
            header: tTravelers("email"),
        },
        {
            accessorKey: "phone",
            header: tTravelers("phone"),
        },
        {
            accessorKey: "tripCount",
            header: tTravelers("tripCount"),
            cell: ({ row }) => (
                <div className="text-center">{row.original.tripCount}</div>
            ),
        },
        {
            accessorKey: "lastTripDate",
            header: tTravelers("lastTripDate"),
        },
        {
            accessorKey: "status",
            header: tTravelers("status"),
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<Traveler["status"], "default" | "secondary" | "outline"> = {
                    active: "default",
                    inactive: "secondary",
                    pending: "outline",
                };

                return (
                    <Badge variant={variants[status]}>
                        {tTravelers(status)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "totalSpent",
            header: tTravelers("totalSpent"),
            cell: ({ row }) => (
                <div className="text-right font-medium flex">
                    ${row.original.totalSpent.toLocaleString()}
                </div>
            ),
        },
    ], [tTravelers]);

    // Define actions
    const actions = useMemo(() => {
        if (showArchived) {
            return [
                {
                    label: "Restore",
                    onClick: handleRestore,
                },
                {
                    label: "Delete",
                    onClick: handleDelete,
                },
            ];
        } else {
            return [
                {
                    label: "Edit",
                    onClick: handleEdit,
                },
                {
                    label: "Delete",
                    onClick: handleDelete,
                },
            ];
        }
    }, [showArchived, handleEdit, handleDelete, handleRestore]);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 items-center bg-card px-3 rounded-xl justify-end">



                {/* Filter Bar */}
                <TableFilterBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={handleClearFilters}
                    statusOptions={statusOptions}
                />
                {/* Archive Toggle */}
                <Button
                    variant="outline"
                    onClick={() => {
                        setShowArchived(!showArchived);
                        setCurrentPage(1);
                    }}
                    className="gap-2"
                >
                    <Archive className="h-4 w-4" />
                    {showArchived ? tTravelers("name") : t("archive")}
                    {archivedTravelers.length > 0 && !showArchived && (
                        <Badge variant="secondary" className="ml-1">
                            {archivedTravelers.length}
                        </Badge>
                    )}
                </Button>

                <Button
                    onClick={() => {

                    }}
                    className="gap-1 bg-primary"
                >
                    <Plus className="h-4 w-4 mt-1" />
                    {t("addTraveler")}
                    {archivedTravelers.length > 0 && !showArchived && (
                        <Badge variant="secondary" className="ml-1">
                            {archivedTravelers.length}
                        </Badge>
                    )}
                </Button>

            </div>

            {/* UniTable */}
            <UniTable<Traveler>
                columns={columns}
                data={filteredTravelers}
                totalItems={filteredTravelers.length}
                itemsPerPage={5}
                currentPage={currentPage}
                tableName={tTravelers("name")}
                actions={actions}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
