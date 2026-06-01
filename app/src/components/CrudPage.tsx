import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import type { FieldConfig } from "../types";

type CrudPageProps = {
    title: string;
    description: string;
    endpoint: string;
    fields: FieldConfig[];
    tableFields?: string[];
    searchFields?: string[];
};

const toInputDateTime = (value: string | undefined | null) => {
    if (!value) return "";
    if (value.includes("T")) return value.slice(0, 16);
    return value.replace(" ", "T").slice(0, 16);
};

const isDateLike = (value: string) =>
    /fecha|hora|date|time/i.test(value);

export default function CrudPage({
    title,
    description,
    endpoint,
    fields,
    tableFields,
    searchFields,
}: CrudPageProps) {
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const formFields = useMemo(() => {
        return fields.filter((f) => !f.auto);
    }, [fields]);

    const visibleFormFields = useMemo(() => {
        if (endpoint !== "archivos") return formFields;

        return formFields.filter(
            (f) => f.name !== "nombre" && f.name !== "ruta"
        );
    }, [formFields, endpoint]);

const buildEmptyForm = () => {
    const base: Record<string, any> = {};
    formFields.forEach((field) => {
        if (field.type === "checkbox") base[field.name] = false;
        else if (field.type === "number") base[field.name] = "";
        else if (field.type === "json") base[field.name] = "{}";
        else if (field.type === "select") base[field.name] = field.options?.[0]?.value ?? "";
        else base[field.name] = "";
    });
    return base;
};

const [rows, setRows] = useState<Record<string, any>[]>([]);
const [form, setForm] = useState<Record<string, any>>(buildEmptyForm());
const [editingId, setEditingId] = useState<number | null>(null);
const [openModal, setOpenModal] = useState(false);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [query, setQuery] = useState("");

useEffect(() => {
    setForm(buildEmptyForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [endpoint, fields.length]);

const loadData = async () => {
    setLoading(true);
    try {
        const { data } = await api.get(`/${endpoint}`);

        setRows(
            Array.isArray(data)
            ? data
            : data.archivos ||
            data.usuarios ||
            data.leads ||
            data.eventos ||
            data.notas ||
            data.data ||
            []
        );
    } catch (error) {
        console.error(error);
        toast.error(`No se pudo cargar ${title.toLowerCase()}`);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [endpoint]);

const handleChange = (name: string, value: any, type: FieldConfig["type"]) => {
    if (type === "checkbox") {
        setForm((prev) => ({ ...prev, [name]: Boolean(value) }));
        return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
};

const openCreate = () => {
    setEditingId(null);
    setForm(buildEmptyForm());
    setOpenModal(true);
    setSelectedFile(null);
};

const openEdit = (row: Record<string, any>) => {
    setEditingId(row.id);
    const next: Record<string, any> = {};
    formFields.forEach((field) => {
        const current = row[field.name];
        if (field.type === "checkbox") next[field.name] = Boolean(current);
        else if (field.type === "json") next[field.name] = typeof current === "string" ? current : JSON.stringify(current ?? {}, null, 2);
        else if (field.type === "datetime-local") next[field.name] = toInputDateTime(current);
        else next[field.name] = current ?? "";
    });
    setForm(next);
    setOpenModal(true);
};

const serializePayload = () => {
    const payload: Record<string, any> = {};

    formFields.forEach((field) => {
        const value = form[field.name];

        if (field.type === "checkbox") {
            payload[field.name] = Boolean(value);
            return;
        }

        if (field.type === "number") {
            payload[field.name] = value === "" ? null : Number(value);
            return;
        }

        if (field.type === "json") {
            try {
            payload[field.name] = typeof value === "string" ? JSON.parse(value || "{}") : value;
            } catch {
                throw new Error(`El campo ${field.label} debe contener JSON válido`);
            }
            return;
        }

        payload[field.name] = value === "" ? null : value;
    });

    return payload;
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        const payload = serializePayload();

        if (editingId) {
            await api.put(`/${endpoint}/${editingId}`, payload);
            toast.success("Registro actualizado");
        } else {
            await api.post(`/${endpoint}`, payload);
            toast.success(
                endpoint === "archivos"
                    ? "Archivo registrado correctamente"
                    : "Registro creado"
            );
        }

        setOpenModal(false);
        setEditingId(null);
        setSelectedFile(null);
        setForm(buildEmptyForm());
        await loadData();

    } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Ocurrió un error al guardar");
    } finally {
        setSaving(false);
    }
};

const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este registro?");
    if (!confirmDelete) return;

    try {
        await api.delete(`/${endpoint}/${id}`);
        toast.success("Registro eliminado");
        await loadData();
    } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar el registro");
    }
};

const filteredRows = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();

    const keys = searchFields?.length
        ? searchFields
        : fields.map((f) => f.name);

    return rows.filter((row) =>
        keys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
}, [fields, query, rows, searchFields]);

const columns = tableFields?.length ? tableFields : ["id", ...fields.map((f) => f.name)];

const getLabel = (name: string) =>
    fields.find((f) => f.name === name)?.label ?? name;

return (
    <div className="zm-page">
        <div className="zm-page__header">
            <div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>

            <div className="zm-page__actions">
                <input
                    className="zm-input"
                    placeholder="Buscar..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="zm-btn zm-btn--primary" onClick={openCreate}>
                    Nuevo registro
                </button>
            </div>
        </div>

        <div className="zm-card">
            {loading ? (
                <p>Cargando datos...</p>
            ) : (
            <div className="zm-table-wrap">
                <table className="zm-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column}>{getLabel(column)}</th>
                            ))}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: "center" }}>
                                    No hay registros
                                </td>
                            </tr>
                        ) : (
                        filteredRows.map((row) => (
                            <tr key={row.id}>
                                {columns.map((column) => {
                                    const value = row[column];
                                    const fieldType = fields.find((f) => f.name === column)?.type;

                                    return (
                                        <td key={column}>
                                            {fieldType === "checkbox"
                                            ? value ? "Sí" : "No"
                                            : fieldType === "json"
                                            ? typeof value === "string"
                                            ? value
                                            : JSON.stringify(value)
                                            : String(value ?? "")}
                                        </td>
                                    );
                                })}
                                <td>
                                    <div className="zm-actions">
                                        <button className="zm-btn zm-btn--ghost" onClick={() => openEdit(row)}>
                                            Editar
                                        </button>
                                        <button className="zm-btn zm-btn--danger" onClick={() => handleDelete(row.id)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>

    {openModal && (
        <div className="zm-modal-overlay" onClick={() => setOpenModal(false)}>
            <div className="zm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="zm-modal__header">
                    <h2>{editingId ? "Editar" : "Nuevo"} {title}</h2>
                    <button
                        type="button"
                        className="zm-modal-close"
                        onClick={() => setOpenModal(false)}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="zm-form">
                    <div className="zm-form-grid">
                    {visibleFormFields.map((field) => {
                        const value = form[field.name];

                        return (
                        <div className="zm-field" key={field.name}>
                            <label>{field.label}</label>

                            {field.type === "textarea" ? (
                                <textarea
                                    className="zm-input"
                                    rows={4}
                                    value={value}
                                    onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                    placeholder={field.placeholder}
                                />
                            ) : field.type === "select" ? (
                                <select
                                    className="zm-input"
                                    value={value}
                                    onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                >
                                    {field.options?.map((option) => (
                                        <option key={String(option.value)} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === "checkbox" ? (
                                <input
                                    type="checkbox"
                                    checked={Boolean(value)}
                                    onChange={(e) => handleChange(field.name, e.target.checked, field.type)}
                                />
                            ) : field.type === "json" ? (
                                <textarea
                                    className="zm-input zm-input--mono"
                                    rows={5}
                                    value={value}
                                    onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                    placeholder='{"clave":"valor"}'
                                />
                            ) : (
                                <input
                                    className="zm-input"
                                    type={field.type ?? "text"}
                                    value={value}
                                    onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                    placeholder={field.placeholder}
                                />
                            )}
                        </div>
                        );
                    })}
                    </div>

                    <div className="zm-modal__footer">
                        {endpoint === "archivos" && (
                            <div className="upload-container">
                                <label className="upload-title">📂 Seleccionar archivo</label>

                                <input
                                    className="upload-input"
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];

                                        if (file) {
                                            setSelectedFile(file);

                                            setForm((prev) => ({
                                                ...prev,
                                                nombre: file.name,
                                                ruta: `/uploads/${file.name}`,
                                            }));
                                        }
                                    }}
                                />

                                {selectedFile && (
                                    <div className="file-preview">
                                        <div className="file-icon">
                                            {selectedFile.type.includes("pdf") && "📕"}
                                            {selectedFile.type.includes("image") && "🖼️"}
                                            {selectedFile.type.includes("word") && "📄"}
                                            {selectedFile.type.includes("excel") && "📊"}
                                            {!selectedFile.type.includes("pdf") &&
                                                !selectedFile.type.includes("image") &&
                                                !selectedFile.type.includes("word") &&
                                                !selectedFile.type.includes("excel") &&
                                            "📁"}
                                        </div>

                                        <div className="file-info">
                                            <h4>{selectedFile.name}</h4>
                                            <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                            <span>{selectedFile.type || "Archivo"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <button type="button" className="zm-btn zm-btn--ghost" onClick={() => setOpenModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="zm-btn zm-btn--primary" disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        )}
    </div>
    );
}