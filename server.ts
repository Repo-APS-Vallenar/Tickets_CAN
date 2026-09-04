import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body parser for photo uploads / evidence
app.use(express.json({ limit: "15mb" }));

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(apiKey),
    cesfamName: "CESFAM Metropolitano APS",
    engineers: [
      { role: "informatica", name: "Ing. en Informática (TI & Redes)" },
      { role: "mantenimiento", name: "Ing. en Mantenimiento (Infraestructura & Equipos)" },
    ],
  });
});

// AI Ticket Classification based on CESFAM Operational Criticality Matrix
app.post("/api/ai/classify-ticket", async (req, res) => {
  try {
    const {
      title,
      description,
      equipmentId,
      equipmentName,
      sector,
      reporterName,
      reporterRole,
    } = req.body;

    if (!ai) {
      // Fallback heuristics if API key is not yet set
      const isIT =
        /pc|computador|impresora|red|wifi|internet|pantalla|mouse|teclado|rayen|correo|servidor|switch|cable red|sistema/i.test(
          `${title} ${description} ${equipmentName}`
        );
      const isCriticalArea = /farmacia|vacunatorio|sapu|urgencia|refrigerador|frio|cadena/i.test(
        `${sector} ${equipmentName} ${title}`
      );
      return res.json({
        suggestedDepartment: isIT ? "informatica" : "mantenimiento",
        suggestedPriority: isCriticalArea ? "urgente" : "media",
        suggestedSlaMinutes: isCriticalArea ? 30 : 240,
        impactLevel: isCriticalArea
          ? "CRÍTICO - Riesgo directo en flujo de atención sanitaria o cadena de frío"
          : "REGULAR - Impacto operacional moderado sin detención inmediata",
        justification: `Clasificado por reglas de contingencia CESFAM para el sector ${sector}.`,
        contingencyTip: isCriticalArea
          ? "Favor no reiniciar equipo sensible y verificar registro manual temporal mientras asiste el profesional."
          : "El ingeniero asignado ha sido alertado y revisará su solicitud en la cola de trabajo.",
      });
    }

    const systemInstruction = `
Eres el Asistente de Operaciones e IA del Sistema de Soporte Técnico y Mantenimiento de un CESFAM (Centro de Salud Familiar, Atención Primaria de Salud).
Trabajas coordinando las tareas de DOS ingenieros internos del CESFAM:
1) Ingeniero en Informática: Redes, switches, Wi-Fi, cableado estructurado, PCs, pantallas, impresoras de SOME/Farmacia/Rayén, sistema de ficha clínica electrónica, telefonía IP, servidores locales.
2) Ingeniero en Mantenimiento: Electricidad, tableros eléctricos, climatización (aire acondicionado), grupo electrógeno, refrigeradores de vacunas/cadena de frío, compresores dentales, bombas de agua, iluminación, cerraduras, sanitarios y gases clínicos.

OJO: Ninguno de los dos atiende pacientes directamente, pero sus fallas impactan brutalmente la operatividad del CESFAM.

MATRIZ DE IMPACTO EN LA OPERATIVIDAD (CRITICIDAD):
- "urgente":
  * Farmacia: Si el PC o impresora falla y se detiene la entrega de medicamentos.
  * Vacunatorio: Si el refrigerador o termostato de vacunas falla (¡peligro de pérdida de cadena de frío y biológicos millonarios!).
  * SAPU / Urgencias / Sala de Reanimación: Cualquier falla de energía, red o equipo crítico.
  * Red central caída: Afecta a todo el CESFAM impidiendo abrir Rayen (ficha clínica).
  * Tablero eléctrico cortado o inundación.
- "alta":
  * Box dental con compresor fallando o Box médico con PC apagado en medio de jornada de citas.
  * SOME (Admisión) sin impresora de bonos o sin red (largas filas de adultos mayores y madres).
  * Climatización en salas de espera o box con temperaturas extremas que afectan a usuarios.
- "media":
  * PC o impresora de oficinas administrativas, dirección o archivo.
  * Luces secundarias titilando, teléfono interno secundario.
- "baja":
  * Consultas generales, cambio de cables cosméticos, tareas preventivas sin afectación del servicio activo.

Analiza el caso y devuelve estrictamente un objeto JSON con la clasificación técnica y sugerencias inmediatas.
    `;

    const prompt = `
Ticket ingresado:
- Título: ${title || "Sin título"}
- Descripción de la falla: ${description}
- Identificador de Equipo: ${equipmentId || "No especificado"}
- Nombre de Equipo: ${equipmentName || "No especificado"}
- Sector / Ubicación CESFAM: ${sector || "General"}
- Solicitado por: ${reporterName || "Funcionario"} (${reporterRole || "Personal CESFAM"})

Determina departamento responsable ("informatica" o "mantenimiento"), prioridad ("urgente", "alta", "media", "baja"), tiempo máximo de respuesta SLA en minutos (ej: 15-30 para urgente, 60-120 para alta, 240 para media, 720 para baja), análisis de impacto operativo en el CESFAM, justificación técnica concisa y una recomendación de contingencia inmediata para el funcionario que reportó.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedDepartment: {
              type: Type.STRING,
              description: "informatica o mantenimiento",
            },
            suggestedPriority: {
              type: Type.STRING,
              description: "baja, media, alta o urgente",
            },
            suggestedSlaMinutes: {
              type: Type.NUMBER,
              description: "Tiempo objetivo de atención en minutos",
            },
            impactLevel: {
              type: Type.STRING,
              description: "Nivel de impacto operacional sintético",
            },
            justification: {
              type: Type.STRING,
              description: "Explicación de por qué este caso tiene esa criticidad según la dinámica del CESFAM",
            },
            contingencyTip: {
              type: Type.STRING,
              description: "Acción de contingencia o calma para el funcionario mientras acude el ingeniero",
            },
          },
          required: [
            "suggestedDepartment",
            "suggestedPriority",
            "suggestedSlaMinutes",
            "impactLevel",
            "justification",
            "contingencyTip",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    // Sanitize values
    const validDept =
      parsed.suggestedDepartment?.toLowerCase().includes("manten")
        ? "mantenimiento"
        : "informatica";
    const validPriority = ["baja", "media", "alta", "urgente"].includes(
      parsed.suggestedPriority?.toLowerCase()
    )
      ? parsed.suggestedPriority.toLowerCase()
      : "media";

    res.json({
      suggestedDepartment: validDept,
      suggestedPriority: validPriority,
      suggestedSlaMinutes: parsed.suggestedSlaMinutes || 120,
      impactLevel: parsed.impactLevel || "Operación regular CESFAM",
      justification: parsed.justification || "Evaluado por matriz de impacto operativo",
      contingencyTip: parsed.contingencyTip || "Por favor espere la llegada del técnico responsable.",
    });
  } catch (error: any) {
    console.error("Error classifying ticket with Gemini:", error);
    res.status(500).json({
      error: "No se pudo clasificar automáticamente con IA",
      message: error?.message,
    });
  }
});

// AI Diagnostic helper for the engineers
app.post("/api/ai/suggest-diagnostic", async (req, res) => {
  try {
    const { ticketTitle, description, equipmentName, sector, department } = req.body;
    if (!ai) {
      return res.json({
        diagnosticSteps: [
          "Verificar cables físicos de energía y conexión.",
          "Verificar si el interruptor o automático del sector está activo.",
          "Comprobar enlace de red con ping a gateway local.",
        ],
        estimatedResolutionTime: "25 minutos",
        preventiveAdvice: "Registrar incidente en la bitácora mensual de equipos.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `
Proporciona un checklist de diagnóstico técnico rápido y pasos de resolución para el ingeniero en ${department} del CESFAM ante esta incidencia:
Equipo: ${equipmentName} (${sector})
Problema: ${ticketTitle} - ${description}

Responde en formato JSON con 'diagnosticSteps' (array de 3 a 4 pasos técnicos directos y concretos), 'estimatedResolutionTime' (string) y 'preventiveAdvice' (string).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosticSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Pasos técnicos ordenados para diagnosticar y reparar",
            },
            estimatedResolutionTime: { type: Type.STRING },
            preventiveAdvice: { type: Type.STRING },
          },
          required: ["diagnosticSteps", "estimatedResolutionTime", "preventiveAdvice"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error generating diagnostic:", error);
    res.status(500).json({ error: "Error en asistente de diagnóstico" });
  }
});

// Vite Middleware for development vs production static serve
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CESFAM Server] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
