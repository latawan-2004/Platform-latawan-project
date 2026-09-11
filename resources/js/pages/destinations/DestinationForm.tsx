import { useForm } from '@inertiajs/react';
import { ImagePlus, LoaderCircle, Upload } from 'lucide-react';
import * as React from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Destination } from '@/types';

type DestinationStatus = Destination['status'];

export type DestinationFormValues = {
    name: string;
    location: string;
    description: string;
    category: string;
    entrance_fee: string;
    opening_hours: string;
    contact: string;
    latitude: string;
    longitude: string;
    difficulty: string;
    status: DestinationStatus;
    image: File | null;
};

type DestinationFormProps = {
    destination?: Destination;
    submitUrl: string;
    method: 'post' | 'put';
    submitLabel: string;
    onCancel?: () => void;
};

const categories = [
    'Waterfall',
    'Mountain & Peak',
    'Beach & Coast',
    'Cave & Underground',
    'Forest & Trail',
    'River & Spring',
    'Lake',
    'Island & Sandbar',
    'Heritage & Cultural',
    'Camping & Eco-Park',
];

const difficulties = ['Easy', 'Moderate', 'Hard', 'Challenging'];

const emptyValues: DestinationFormValues = {
    name: '',
    location: '',
    description: '',
    category: '',
    entrance_fee: '0',
    opening_hours: '',
    contact: '',
    latitude: '',
    longitude: '',
    difficulty: '',
    status: 'draft',
    image: null,
};

const valuesFromDestination = (
    destination?: Destination,
): DestinationFormValues =>
    destination
        ? {
              name: destination.name,
              location: destination.location,
              description: destination.description,
              category: destination.category,
              entrance_fee: String(destination.entrance_fee ?? 0),
              opening_hours: destination.opening_hours ?? '',
              contact: destination.contact ?? '',
              latitude:
                  destination.latitude === null
                      ? ''
                      : String(destination.latitude),
              longitude:
                  destination.longitude === null
                      ? ''
                      : String(destination.longitude),
              difficulty: destination.difficulty ?? '',
              status: destination.status,
              image: null,
          }
        : emptyValues;

const validate = (values: DestinationFormValues): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.name.trim()) errors.name = 'Name is required.';
    if (values.name.length > 255)
        errors.name = 'Name must not exceed 255 characters.';
    if (!values.location.trim()) errors.location = 'Location is required.';
    if (values.location.length > 255)
        errors.location = 'Location must not exceed 255 characters.';
    if (!values.description.trim())
        errors.description = 'Description is required.';
    if (!values.category) errors.category = 'Category is required.';
    if (
        values.entrance_fee &&
        (Number.isNaN(Number(values.entrance_fee)) ||
            Number(values.entrance_fee) < 0)
    ) {
        errors.entrance_fee = 'Entrance fee must be a number of 0 or more.';
    }
    if (
        values.latitude &&
        (Number.isNaN(Number(values.latitude)) ||
            Number(values.latitude) < -90 ||
            Number(values.latitude) > 90)
    ) {
        errors.latitude = 'Latitude must be between -90 and 90.';
    }
    if (
        values.longitude &&
        (Number.isNaN(Number(values.longitude)) ||
            Number(values.longitude) < -180 ||
            Number(values.longitude) > 180)
    ) {
        errors.longitude = 'Longitude must be between -180 and 180.';
    }
    if (!values.status) errors.status = 'Status is required.';

    return errors;
};

export default function DestinationForm({
    destination,
    submitUrl,
    method,
    submitLabel,
    onCancel,
}: DestinationFormProps) {
    const form = useForm<DestinationFormValues>(
        valuesFromDestination(destination),
    );
    const [clientErrors, setClientErrors] = React.useState<
        Record<string, string>
    >({});
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(
        destination?.image ? `/storage/${destination.image}` : null,
    );
    const [imageError, setImageError] = React.useState('');

    React.useEffect(
        () => () => {
            if (previewUrl?.startsWith('blob:'))
                URL.revokeObjectURL(previewUrl);
        },
        [previewUrl],
    );

    const errorFor = (field: keyof DestinationFormValues): string | undefined =>
        clientErrors[field] ?? form.errors[field];

    const updateField = <K extends keyof DestinationFormValues>(
        field: K,
        value: DestinationFormValues[K],
    ): void => {
        form.setData(field, value as never);
        setClientErrors((current) => ({ ...current, [field]: '' }));
    };

    const handleImageChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const file = event.target.files?.[0] ?? null;
        setImageError('');

        if (!file) {
            updateField('image', null);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setImageError('Image must be a JPG, PNG, or WEBP file.');
            event.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError('Image must not exceed 5 MB.');
            event.target.value = '';
            return;
        }

        setPreviewUrl((current) => {
            if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
            return URL.createObjectURL(file);
        });
        updateField('image', file);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const errors = validate(form.data);
        setClientErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const options = {
            forceFormData: true,
            onError: (serverErrors: Record<string, string>) => {
                setClientErrors(serverErrors);
            },
        } as const;

        if (method === 'post') {
            form.post(submitUrl, options);
        } else {
            form.put(submitUrl, options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-8" noValidate>
            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <Field
                    label="Name"
                    name="name"
                    error={errorFor('name')}
                    required
                >
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(event) =>
                            updateField('name', event.target.value)
                        }
                        aria-invalid={Boolean(errorFor('name'))}
                    />
                </Field>

                <Field
                    label="Location"
                    name="location"
                    error={errorFor('location')}
                    required
                >
                    <Input
                        id="location"
                        value={form.data.location}
                        onChange={(event) =>
                            updateField('location', event.target.value)
                        }
                        aria-invalid={Boolean(errorFor('location'))}
                    />
                </Field>

                <Field
                    label="Category"
                    name="category"
                    error={errorFor('category')}
                    required
                >
                    <select
                        id="category"
                        value={form.data.category}
                        onChange={(event) =>
                            updateField('category', event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50/70 px-3 text-sm text-emerald-950"
                        aria-invalid={Boolean(errorFor('category'))}
                    >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field
                    label="Difficulty"
                    name="difficulty"
                    error={errorFor('difficulty')}
                >
                    <select
                        id="difficulty"
                        value={form.data.difficulty}
                        onChange={(event) =>
                            updateField('difficulty', event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50/70 px-3 text-sm text-emerald-950"
                    >
                        <option value="">Not specified</option>
                        {difficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field
                    label="Entrance fee"
                    name="entrance_fee"
                    error={errorFor('entrance_fee')}
                >
                    <Input
                        id="entrance_fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.data.entrance_fee}
                        onChange={(event) =>
                            updateField('entrance_fee', event.target.value)
                        }
                        aria-invalid={Boolean(errorFor('entrance_fee'))}
                    />
                </Field>

                <Field
                    label="Status"
                    name="status"
                    error={errorFor('status')}
                    required
                >
                    <select
                        id="status"
                        value={form.data.status}
                        onChange={(event) =>
                            updateField(
                                'status',
                                event.target.value as DestinationStatus,
                            )
                        }
                        className="h-10 w-full rounded-lg border border-stone-300 bg-stone-50/70 px-3 text-sm text-emerald-950"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </Field>

                <Field
                    label="Opening hours"
                    name="opening_hours"
                    error={errorFor('opening_hours')}
                >
                    <Input
                        id="opening_hours"
                        value={form.data.opening_hours}
                        onChange={(event) =>
                            updateField('opening_hours', event.target.value)
                        }
                        placeholder="e.g. 8:00 AM - 5:00 PM"
                    />
                </Field>

                <Field
                    label="Contact"
                    name="contact"
                    error={errorFor('contact')}
                >
                    <Input
                        id="contact"
                        value={form.data.contact}
                        onChange={(event) =>
                            updateField('contact', event.target.value)
                        }
                    />
                </Field>

                <Field
                    label="Latitude"
                    name="latitude"
                    error={errorFor('latitude')}
                >
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={form.data.latitude}
                        onChange={(event) =>
                            updateField('latitude', event.target.value)
                        }
                    />
                </Field>

                <Field
                    label="Longitude"
                    name="longitude"
                    error={errorFor('longitude')}
                >
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={form.data.longitude}
                        onChange={(event) =>
                            updateField('longitude', event.target.value)
                        }
                    />
                </Field>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">
                        Description <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        value={form.data.description}
                        onChange={(event) =>
                            updateField('description', event.target.value)
                        }
                        aria-invalid={Boolean(errorFor('description'))}
                        className="bg-[#fffdf8] text-emerald-950"
                    />
                    <InputError message={errorFor('description')} />
                </div>
            </div>

            <div className="space-y-3 border-t border-stone-200 pt-6">
                <div>
                    <Label htmlFor="image">Destination image</Label>
                    <p className="mt-1 text-sm text-stone-500">
                        JPG, PNG, or WEBP up to 5 MB.
                    </p>
                </div>
                <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-stone-50">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Destination preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImagePlus className="h-10 w-10 text-slate-400" />
                        )}
                    </div>
                    <div className="space-y-3">
                        <label
                            htmlFor="image"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 bg-[#fffdf8] px-4 py-2 text-sm font-medium text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
                        >
                            <Upload className="h-4 w-4" />
                            {destination?.image
                                ? 'Replace image'
                                : 'Choose image'}
                        </label>
                        <Input
                            id="image"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="sr-only"
                        />
                        <InputError message={imageError || errorFor('image')} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:justify-end">
                {onCancel ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={form.processing}
                        className="border-stone-300 bg-[#fffdf8] text-emerald-950 hover:bg-emerald-50"
                    >
                        Cancel
                    </Button>
                ) : null}
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="min-w-36 bg-emerald-800 text-white shadow-sm hover:bg-emerald-950"
                >
                    {form.processing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : null}
                    {form.processing ? 'Saving...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}

function Field({
    label,
    name,
    error,
    required,
    children,
}: {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}{' '}
                {required ? <span className="text-red-600">*</span> : null}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
