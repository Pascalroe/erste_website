export default {
  async fetch(request, env, ctx) {
    // Nur POST-Anfragen erlauben
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const formData = await request.formData();
      
      // Daten aus dem Formular sammeln
      const name = formData.get("name") || "Nicht angegeben";
      const email = formData.get("email") || "Nicht angegeben";
      const telefon = formData.get("telefon") || "Nicht angegeben";
      const firma = formData.get("firma") || "Nicht angegeben";
      const projektart = formData.get("projektart") || "Nicht angegeben";
      const aktuelleSeite = formData.get("aktuelle-seite") || "Keine";
      const seiten = formData.get("seiten") || "Nicht angegeben";
      const funktionen = formData.get("funktionen") || "Nicht angegeben";
      const design = formData.get("design") || "Nicht angegeben";
      const farben = formData.get("farben") || "Nicht angegeben";
      const budget = formData.get("budget") || "Nicht angegeben";
      const zeitrahmen = formData.get("zeitrahmen") || "Nicht angegeben";
      const nachricht = formData.get("nachricht") || "Keine Nachricht";

      // Pakete sammeln
      const pakete = [];
      if (formData.get("paket-basis")) pakete.push("Basis (690€)");
      if (formData.get("paket-standard")) pakete.push("Standard (1.290€)");
      if (formData.get("paket-premium")) pakete.push("Premium (2.490€)");
      if (formData.get("paket-wartung")) pakete.push("Wartung & Betreuung");
      if (formData.get("paket-unsicher")) pakete.push("Unsicher");
      const paketeText = pakete.length > 0 ? pakete.join(", ") : "Keine Pakete ausgewählt";

      // E-Mail-Inhalt erstellen
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 20px; }
    .field { margin-bottom: 12px; }
    .label { font-weight: 600; color: #475569; }
    .value { color: #1e293b; }
    .section { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <h1>📬 Neue Anfrage von fudora.de</h1>
  
  <div class="section">
    <h2>👤 Über Sie</h2>
    <div class="field"><span class="label">Name:</span> <span class="value">${name}</span></div>
    <div class="field"><span class="label">E-Mail:</span> <span class="value">${email}</span></div>
    <div class="field"><span class="label">Telefon:</span> <span class="value">${telefon}</span></div>
    <div class="field"><span class="label">Firma/Branche:</span> <span class="value">${firma}</span></div>
  </div>

  <div class="section">
    <h2>🎯 Projektart</h2>
    <div class="field"><span class="value">${projektart}</span></div>
  </div>

  <div class="section">
    <h2>📦 Interessante Pakete</h2>
    <div class="field"><span class="value">${paketeText}</span></div>
  </div>

  <div class="section">
    <h2>🔍 Details</h2>
    <div class="field"><span class="label">Aktuelle Webseite:</span> <span class="value">${aktuelleSeite}</span></div>
    <div class="field"><span class="label">Geschätzte Seiten:</span> <span class="value">${seiten}</span></div>
    <div class="field"><span class="label">Gewünschte Funktionen:</span> <span class="value">${funktionen}</span></div>
  </div>

  <div class="section">
    <h2>🎨 Design</h2>
    <div class="field"><span class="label">Stil:</span> <span class="value">${design}</span></div>
    <div class="field"><span class="label">Farbvorlieben:</span> <span class="value">${farben}</span></div>
  </div>

  <div class="section">
    <h2>💰 Budget & Zeit</h2>
    <div class="field"><span class="label">Budget:</span> <span class="value">${budget}</span></div>
    <div class="field"><span class="label">Zeitrahmen:</span> <span class="value">${zeitrahmen}</span></div>
  </div>

  <div class="section">
    <h2>💬 Nachricht</h2>
    <p>${nachricht}</p>
  </div>

  <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
    Diese E-Mail wurde automatisch von fudora.de generiert.
  </p>
</body>
</html>`;

      // E-Mail über Resend senden
      const RESEND_KEY = "re_CkvsteVj_9iE8Ad4TmXPo3c4uRAieC5ch";
      const TO_EMAIL = "pascalroe@proton.me";
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: TO_EMAIL,
          reply_to: email,
          subject: `Neue Anfrage von ${name} - fudora.de`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend error:", error);
        // Debug: Return error details
        return new Response(JSON.stringify({ 
          error: "Failed to send email",
          details: error,
          status: response.status
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Erfolgreich - Weiterleitung zur Danke-Seite
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "/danke.html",
        },
      });

    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};