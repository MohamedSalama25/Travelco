"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { clientAxios } from "@/lib/api/axios";

// Internal useDebounce hook to avoid external dependency
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface AutocompleteSelectProps {
    endpoint: string;
    valueKey?: string;
    labelKey?: string;
    value?: string | number | null;
    onChange: (value: string) => void; // Assuming ID is string based on usage
    placeholder?: string;
    searchParam?: string;
    disabled?: boolean;
}

export function AutocompleteSelect({
    endpoint,
    valueKey = "_id",
    labelKey = "name",
    value,
    onChange,
    placeholder = "Select...",
    searchParam = "search",
    disabled = false,
}: AutocompleteSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: [endpoint, debouncedSearch],
        queryFn: async ({ pageParam = 1 }) => {
            // endpoint can be like 'airComp' or 'customers'
            // We assume basic query params structure: ?page=x&limit=10&search=...
            const res = await clientAxios.get(endpoint, {
                params: {
                    page: pageParam,
                    limit: 10,
                    [searchParam]: debouncedSearch,
                },
            });
            return res.data;
        },
        getNextPageParam: (lastPage) => {
            // Assumes response structure: { pagination: { page, pages } }
            if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.pages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    // Flatten all pages into a single array of items
    const items = React.useMemo(() => {
        return data?.pages.flatMap((page) => page.data || []) || [];
    }, [data]);

    // Find the selected item label to display in the button
    const selectedItem = items.find((item: Record<string, unknown>) => item[valueKey] === value);

    // If we have a value but no selected item found (e.g. initial load), we might want to show "Selected" or ID, 
    // or ideally the parent should pass the display label if known. 
    // For this generic component, let's try to display the label if found, otherwise placeholder or maybe fetch it separately (too complex for now).
    const displayLabel = selectedItem ? String(selectedItem[labelKey]) : (value ? "Selected" : placeholder);

    // Intersection observer for infinite scroll
    const observerTarget = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {displayLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {isLoading && (
                            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading...
                            </div>
                        )}
                        {!isLoading && items.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}

                        <CommandGroup>
                            {items.map((item: Record<string, unknown>) => (
                                <CommandItem
                                    key={String(item[valueKey])}
                                    value={String(item[valueKey])} // Value for accessibility/selection, though we handle click manually
                                    onSelect={() => {
                                        onChange(String(item[valueKey]));
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item[valueKey]
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {String(item[labelKey])}
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        {/* Loader element for infinite scroll */}
                        <div ref={observerTarget} className="h-4 w-full" />

                        {isFetchingNextPage && (
                            <div className="py-2 text-center text-xs text-muted-foreground flex items-center justify-center">
                                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                Loading more...
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
