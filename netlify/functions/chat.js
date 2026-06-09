const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    // Falls es sich um einen Vorab-Check (OPTIONS) handelt, erlauben wir den Zugriff
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }

    try {
        const { systemPrompt, userText } = JSON.parse(event.body);
        const apiKey = process.env.OPENROUTER_API_KEY;

        // Sicherstellen, dass der Key im Netlify-Dashboard existiert
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "API-Key fehlt im Netlify-Dashboard!" })
            };
        }

        // Anfrage an OpenRouter senden
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userText }
                ]
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
