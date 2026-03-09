// Probes Gemini API and prints all rate-limit related headers
async function probe() {
  const key = process.env.GEMINI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      }),
    }
  );

  console.log(`\nStatus: ${res.status} ${res.statusText}`);
  console.log("\n── Rate Limit Headers ──────────────────");
  const relevant = ["retry-after","x-ratelimit-reset","x-ratelimit-remaining","x-ratelimit-limit","ratelimit","ratelimit-policy","x-quota-limit","x-quota-remaining","x-quota-reset"];
  let found = false;
  res.headers.forEach((val, key) => {
    if (relevant.includes(key.toLowerCase()) || key.toLowerCase().includes("rate") || key.toLowerCase().includes("quota") || key.toLowerCase().includes("retry")) {
      console.log(`  ${key}: ${val}`);
      found = true;
    }
  });
  if (!found) console.log("  (no rate-limit headers returned)");

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    if (retryAfter) {
      const sec = parseInt(retryAfter, 10);
      const resetAt = new Date(Date.now() + sec * 1000);
      console.log(`\n🔴 QUOTA EXHAUSTED — resets at: ${resetAt.toLocaleTimeString()} (in ${sec}s)`);
    } else {
      const body = await res.json().catch(() => ({}));
      console.log("\n🔴 QUOTA EXHAUSTED — no Retry-After header. Body:", JSON.stringify(body, null, 2));
    }
  } else if (res.ok) {
    console.log("\n✅ Quota OK — Gemini is available right now.");
  }
}

probe().catch(console.error);
