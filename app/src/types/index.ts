export type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "datetime-local"
    | "date"
    | "json";

export type FieldOption = {
    label: string;
    value: string | number;
};

export type FieldConfig = {
    name: string;
    label: string;
    type?: FieldType;
    placeholder?: string;
    options?: FieldOption[];
    required?: boolean;
    auto?: boolean;
};

export type ModuleConfig = {
    key: string;
    title: string;
    endpoint: string;
    description: string;
    emoji: string;
    fields: FieldConfig[];
    tableFields?: string[];
    searchFields?: string[];
};

export type AuthUser = {
    id: number;
    nombre: string;
    email: string;
    rol_id?: number;
};

export type AuthResponse = {
    token: string;
    user: AuthUser;
};
export interface Archivo {
    id: number;
    usuario_id: number;
    nombre: string;
    ruta: string;
    fecha_subida: string;
}