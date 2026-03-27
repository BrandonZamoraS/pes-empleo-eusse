import type { QuestionFormat } from "../types/jobs";

const QUESTION_FORMATS: Record<
  QuestionFormat,
  {
    inputType: "date" | "number" | "text";
    inputMode?: "decimal" | "numeric" | "text";
    label: string;
    step?: string;
  }
> = {
  text: {
    inputType: "text",
    inputMode: "text",
    label: "Respuesta libre",
  },
  int: {
    inputType: "number",
    inputMode: "numeric",
    label: "Numero entero",
    step: "1",
  },
  decimal: {
    inputType: "number",
    inputMode: "decimal",
    label: "Numero con decimales",
    step: "any",
  },
  boolean: {
    inputType: "text",
    label: "Si / No",
  },
  date: {
    inputType: "date",
    label: "Fecha",
  },
};

export function buildJobActionFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (key === "questions") {
      formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
      continue;
    }

    formData.append(key, String(value));
  }

  return formData;
}

export function getQuestionFieldConfig(format?: QuestionFormat) {
  return QUESTION_FORMATS[format ?? "text"] ?? QUESTION_FORMATS.text;
}

export function validateQuestionAnswer(
  format: QuestionFormat | undefined,
  value: string,
  description: string,
): string | null {
  const expected = format ?? "text";
  const trimmed = value.trim();

  switch (expected) {
    case "int":
      if (!/^-?\d+$/.test(trimmed)) {
        return `La pregunta "${description}" necesita un numero entero.`;
      }
      return null;
    case "decimal":
      if (trimmed.length === 0 || Number.isNaN(Number(trimmed))) {
        return `La pregunta "${description}" necesita un numero.`;
      }
      return null;
    case "boolean":
      if (trimmed !== "true" && trimmed !== "false") {
        return `La pregunta "${description}" se responde con Si o No.`;
      }
      return null;
    case "date":
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(Date.parse(trimmed))) {
        return `La pregunta "${description}" necesita una fecha valida.`;
      }
      return null;
    default:
      return null;
  }
}
