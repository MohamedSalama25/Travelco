import { z } from "zod";

// Zod validation schema
export const customerSchema = z.object({
    name: z.string()
        .min(2, { message: "nameMin" })
        .max(100, { message: "nameTooLong" }),
    email: z.string()
        .email({ message: "emailInvalid" }),
    phone: z.string()
        .min(10, { message: "phoneInvalid" })
        .max(20, { message: "phoneInvalid" }),
    company: z.string().optional(),
    address: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    joinDate: string;
    isArchived?: boolean;
}

// Mock Data
export const mockCustomers: Customer[] = [
    {
        id: "1",
        name: "أحمد عبدالله",
        email: "ahmed.abdullah@example.com",
        phone: "+20 100 123 4567",
        company: "شركة التقنية المتقدمة",
        address: "القاهرة، مصر",
        joinDate: "2023-01-15",
    },
    {
        id: "2",
        name: "Sarah Williams",
        email: "sarah.w@techcorp.com",
        phone: "+1 555 234 5678",
        company: "TechCorp Solutions",
        address: "New York, USA",
        joinDate: "2023-02-20",
    },
    {
        id: "3",
        name: "محمد حسن",
        email: "mohamed.hassan@business.com",
        phone: "+966 50 987 6543",
        company: "مؤسسة الأعمال الحديثة",
        address: "الرياض، السعودية",
        joinDate: "2023-03-10",
    },
    {
        id: "4",
        name: "Emma Chen",
        email: "emma.chen@innovate.io",
        phone: "+86 138 1234 5678",
        company: "Innovate Labs",
        address: "Shanghai, China",
        joinDate: "2023-04-05",
    },
    {
        id: "5",
        name: "فاطمة علي",
        email: "fatima.ali@consulting.ae",
        phone: "+971 50 111 2222",
        company: "استشارات الخليج",
        address: "دبي، الإمارات",
        joinDate: "2023-05-12",
    },
    {
        id: "6",
        name: "James Anderson",
        email: "j.anderson@globaltech.com",
        phone: "+44 7700 900123",
        company: "Global Tech Ltd",
        address: "London, UK",
        joinDate: "2023-06-18",
    },
    {
        id: "7",
        name: "ليلى محمود",
        email: "layla.mahmoud@design.com",
        phone: "+20 111 555 7777",
        company: "استوديو التصميم الإبداعي",
        address: "الإسكندرية، مصر",
        joinDate: "2023-07-22",
    },
    {
        id: "8",
        name: "Michael Brown",
        email: "m.brown@startup.io",
        phone: "+1 555 876 5432",
        company: "Startup Ventures",
        address: "San Francisco, USA",
        joinDate: "2023-08-30",
    },
    {
        id: "9",
        name: "نور الدين",
        email: "noureldeen@trading.com",
        phone: "+971 55 333 4444",
        company: "شركة التجارة الدولية",
        address: "أبوظبي، الإمارات",
        joinDate: "2023-09-14",
    },
    {
        id: "10",
        name: "Sophie Martin",
        email: "sophie.m@consulting.fr",
        phone: "+33 6 12 34 56 78",
        company: "Martin Consulting",
        address: "Paris, France",
        joinDate: "2023-10-08",
    },
    {
        id: "11",
        name: "عمر خالد",
        email: "omar.khaled@tech.sa",
        phone: "+966 55 888 9999",
        company: "تقنية المستقبل",
        address: "جدة، السعودية",
        joinDate: "2023-11-20",
    },
    {
        id: "12",
        name: "Lisa Johnson",
        email: "lisa.j@marketing.com",
        phone: "+1 555 345 6789",
        company: "Digital Marketing Pro",
        address: "Los Angeles, USA",
        joinDate: "2023-12-05",
    },
];
