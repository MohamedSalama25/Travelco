import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date?: Date) => void
    className?: string
    placeholder?: string
}

export function DatePicker({ value, onChange, className, placeholder = "Pick a date" }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value)

    React.useEffect(() => {
        setDate(value)
    }, [value])

    // Helper function to format date in local timezone (YYYY-MM-DD)
    const formatDateToLocal = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const handleSelect = (newDate: Date | undefined) => {
        setDate(newDate)
        if (onChange) {
            onChange(newDate)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    )
}