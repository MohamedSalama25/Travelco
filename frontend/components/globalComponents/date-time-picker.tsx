"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
    value?: Date
    onChange?: (date?: Date) => void
    className?: string
    placeholder?: string
    disabled?: boolean
}

export function DateTimePicker({ value, onChange, className, placeholder = "اختر التاريخ والوقت", disabled }: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value)

    React.useEffect(() => {
        // If value is provided as date objects from outside
        if (value && value instanceof Date && !isNaN(value.getTime())) {
            setDate(value)
        }
    }, [value])

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) return;
        
        const updatedDate = new Date(newDate);
        if (date) {
            updatedDate.setHours(date.getHours());
            updatedDate.setMinutes(date.getMinutes());
        }
        
        setDate(updatedDate);
        if (onChange) {
            onChange(updatedDate);
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value; // HH:mm
        if (!time) return;

        const [hours, minutes] = time.split(':').map(Number);
        const updatedDate = date ? new Date(date) : new Date();
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        updatedDate.setSeconds(0);
        updatedDate.setMilliseconds(0);

        setDate(updatedDate);
        if (onChange) {
            onChange(updatedDate);
        }
    }

    const timeValue = date ? format(date, "HH:mm") : "00:00";

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
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy HH:mm") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-col" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="rounded-md border-b"
                    captionLayout="dropdown"
                />
                <div className="p-3 border-t flex items-center gap-2 bg-muted/50">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                        type="time"
                        value={timeValue}
                        onChange={handleTimeChange}
                        className="h-8 py-1"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
