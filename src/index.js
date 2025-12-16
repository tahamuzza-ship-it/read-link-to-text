import mammoth from "mammoth";

function normalizeUrl(url) {
  // Si es Google Docs, exportar como DOCX automáticamente
  if (url.includes("docs.google.com/document")) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://docs.google.com/document/d/${match[1]}/export?format=docx`;
    }
  }
  return url;
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Use POST", { status: 405 });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    let url = data.url;
    if (!url) {
      return new Response("Missing url", { status: 400 });
    }

    url = normalizeUrl(url);

    const response = await fetch(url);
    if (!response.ok) {
      return new Response("Cannot fetch file", { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return new Response(
      JSON.stringify({ text: result.value }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
