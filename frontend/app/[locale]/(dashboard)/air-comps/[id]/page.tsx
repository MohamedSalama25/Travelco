import AirCompDetailsTemplate from "@/features/air-comps/template/AirCompDetailsTemplate";

export default async function AirCompDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <AirCompDetailsTemplate id={id} />;
}
