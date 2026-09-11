export type Destination = {
    id: number;
    name: string;
    location: string;
    description: string;
    category: string;
    entrance_fee: number;
    opening_hours: string | null;
    contact: string | null;
    latitude: number | null;
    longitude: number | null;
    difficulty: string | null;
    image: string | null;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
};
