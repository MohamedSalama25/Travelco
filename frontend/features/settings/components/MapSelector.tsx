"use client";

import { useState, useEffect, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

/* =========================
   Fix Leaflet marker icons
========================= */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* =========================
   Types
========================= */
interface MapSelectorProps {
    value?: { lat: number; lng: number };
    onChange: (data: {
        lat: number;
        lng: number;
        address: string;
    }) => void;
    initialAddress?: string;
}

/* =========================
   Marker click handler
========================= */
function LocationMarker({
    value,
    onChange,
}: {
    value: { lat: number; lng: number };
    onChange: (pos: { lat: number; lng: number }) => void;
}) {
    useMapEvents({
        click(e) {
            onChange({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
        },
    });

    return value ? (
        <Marker position={[value.lat, value.lng]} />
    ) : null;
}

/* =========================
   Change map center
========================= */
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
    }, [center, map]);

    return null;
}

/* =========================
   Main Component
========================= */
export default function MapSelectorClient({
    value,
    onChange,
    initialAddress,
}: MapSelectorProps) {
    const t = useTranslations("settings");

    const [pos, setPos] = useState(
        value ?? { lat: 30.0444, lng: 31.2357 }
    );
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(initialAddress ?? "");

    /* Reverse geocoding */
    const fetchAddress = useCallback(
        async (lat: number, lng: number) => {
            setLoading(true);
            try {
                const res = await axios.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    {
                        params: {
                            format: "json",
                            lat,
                            lon: lng,
                            "accept-language": "ar",
                        },
                    }
                );

                const newAddress = res.data?.display_name ?? "";

                setAddress(newAddress);
                onChange({ lat, lng, address: newAddress });
            } catch (e) {
                console.error(e);
                toast.error(t("geolocationError"));
            } finally {
                setLoading(false);
            }
        },
        [onChange, t]
    );

    const handlePosChange = (newPos: { lat: number; lng: number }) => {
        setPos(newPos);
        fetchAddress(newPos.lat, newPos.lng);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error(t("browserNoGeolocation"));
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handlePosChange({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {
                setLoading(false);
                toast.error(t("geolocationError"));
            }
        );
    };

    return (
        <div className="space-y-4">
            {/* Address bar */}
            <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md border border-dashed">
                <div className="text-sm flex items-center gap-2 text-muted-foreground truncate flex-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                        {address || t("selectOnMap")}
                    </span>
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={useCurrentLocation}
                    className="gap-2 ml-2"
                >
                    <Search className="h-4 w-4" />
                    {t("myLocation")}
                </Button>
            </div>

            {/* Map */}
            <div className="h-80 rounded-md overflow-hidden border relative">
                <MapContainer
                    center={[pos.lat, pos.lng]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    <LocationMarker
                        value={pos}
                        onChange={handlePosChange}
                    />

                    <ChangeView center={[pos.lat, pos.lng]} />
                </MapContainer>

                {loading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-[1000]">
                        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}
