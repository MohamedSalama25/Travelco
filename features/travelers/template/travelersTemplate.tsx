'use client';

import TravelersCards from "../components/travelersCards";
import TravelersTable from "../components/travelersTable";

export default function TravelersTemplate() {
    return (
        <div className="space-y-8">
            <TravelersCards />
            <TravelersTable />
        </div>
    );
}