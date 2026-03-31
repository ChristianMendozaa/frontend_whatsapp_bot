"use server";

export async function sendWhatsAppMessageAction(userId: string, to: string, text: string) {
  // En producción deberías cambiar esto por la URL real de tu backend FastAPI e.g., process.env.BACKEND_URL
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

  const response = await fetch(`${backendUrl}/api/webhook/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: userId,
      phone_number: to,
      text: text
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("FastAPI Error:", errorBody);
    throw new Error("El backend no pudo enviar el mensaje por WhatsApp. Revisa la consola de Uvicorn.");
  }

  return await response.json();
}
