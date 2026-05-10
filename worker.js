/**
 * Cloudflare Worker für Kontaktformular
 * 
 * Einrichtung:
 * 1. Cloudflare Dashboard → Workers & Pages → Create Application → Create Worker
 * 2. Diesen Code einfügen und Deployen
 * 3. Die Worker-URL in kontakt.html eintragen (fetch-Ziel)
 * 
 * TEST-MODUS: E-Mails werden nur geloggt, nicht gesendet
 * Wenn du eine Domain hast, unten die Kommentare entfernen
 */

export default {
  async fetch(request, env) {
    // CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Nur POST erlauben
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const formData = await request.formData();

      // Formular-Felder auslesen
      const name = formData.get("name") || "Nicht angegeben";
      const email = formData.get("email");
      const phone = formData.get("phone") || "Nicht angegeben";
      const company = formData.get("company") || "Nicht angegeben";
      const projektart = formData.get("projektart") || "Nicht angegeben";
      const nachricht = formData.get("nachricht") || "Keine Nachricht";
      const dringlichkeit = formData.get("dringlichkeit") || "5";
      
      // Pakete (Checkboxen) - können mehrere sein
      const pakete = formData.getAll("pakete");
      const paketeText = pakete.length > 0 ? pakete.join(", ") : "Keine ausgewählt";
      
      // Weitere Felder
      const websiteCurrent = formData.get("website_current") || "Keine";
      const pages = formData.get("pages") || "Nicht angegeben";
      const funktionen = formData.get("funktionen") || "Nicht angegeben";
      const design = formData.get("design") || "Nicht angegeben";
      const farben = formData.get("farben") || "Nicht angegeben";
      const budget = formData.get("budget") || "Nicht angegeben";
      const timeline = formData.get("timeline") || "Nicht angegeben";

      // Validate email
      if (!email || !email.includes("@")) {
        return new Response(JSON.stringify({ error: "Ungültige E-Mail-Adresse" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // === 1. E-Mail an dich (Pascal) - TEST-MODUS ===
      const adminEmailBody = `
Neue Anfrage über Kontaktformular
===================================

KONTAKTDATEN
------------
Name: ${name}
E-Mail: ${email}
Telefon: ${phone}
Firma: ${company}

PROJEKTDETAILS
-------------
Projektart: ${projektart}
Gewählte Pakete: ${paketeText}

Aktuelle Website: ${websiteCurrent}
Seitenanzahl: ${pages}
Funktionsumfang: ${funktionen}
Design-Präferenz: ${design}
Wunschfarben: ${farben}
Budget: ${budget}
Timeline: ${timeline}

DRINGLICHKEIT
-------------
${dringlichkeit}/10

NACHRICHT
--------
${nachricht}
      `.trim();

      // --- EMAIL SENDEN: Kommentar entfernen wenn Domain aktiv ---
      /*
      await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: "DEINE@EMAIL.DE" }],
              subject: `Neue Anfrage von ${name}`,
            },
          ],
          from: { email: "noreply@DEINE-DOMAIN.DE" },
          content: [
            {
              type: "text/plain",
              value: adminEmailBody,
            },
          ],
        }),
      });
      */
      
      // Stattdessen: Log fürs Testen (siehe Cloudflare Dashboard → Logs)
      console.log("=== NEUE ANFRAGE ===", {
        name, email, phone, company,
        projektart, paketeText, nachricht, dringlichkeit
      });

      // === 2. Automatische Bestätigung an Kunden - TEST-MODUS ===
      // --- EMAIL SENDEN: Kommentar entfernen wenn Domain aktiv ---
      /*
      const customerEmailBody = `...`;
      await fetch("https://api.mailchannels.net/tx/v1/send", { ... });
      */
      
      console.log("=== AUTO-ANTWORT WÜRDE AN ===", email);

      // Erfolgsantwort
      return new Response(
        JSON.stringify({ success: true, message: "Nachricht gesendet!" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

    } catch (error) {
      console.error("Form submission error:", error);
      return new Response(
        JSON.stringify({ error: "Fehler beim Senden. Bitte später erneut versuchen." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};