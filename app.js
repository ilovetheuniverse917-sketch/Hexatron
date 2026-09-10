const prompt = document.getElementById("prompt");
const output = document.getElementById("output");
const send = document.getElementById("send");
const status = document.getElementById("status");
const temperature = document.getElementById("temperature");
const tokens = document.getElementById("tokens");
const tempValue = document.getElementById("tempValue");
const tokenValue = document.getElementById("tokenValue");

temperature.addEventListener("input", () => tempValue.textContent = temperature.value);
tokens.addEventListener("input", () => tokenValue.textContent = tokens.value);

function addMessage(text, who) {
  const row = document.createElement("div");
  row.className = `message ${who}`;
  row.innerHTML = `<div class="avatar">${who === "user" ? "YOU" : "H"}</div>
                   <div class="bubble"></div>`;
  row.querySelector(".bubble").textContent = text;
  output.appendChild(row);
  output.scrollTop = output.scrollHeight;
  return row;
}

async function checkStatus() {
  try {
    const r = await fetch("/api/status");
    const data = await r.json();
    status.innerHTML = `<span></span> ONLINE // ${data.device.toUpperCase()}`;
  } catch {
    status.innerHTML = `<span style="background:#ff6b8a;box-shadow:0 0 9px #ff6b8a"></span> OFFLINE`;
  }
}

async function generate() {
  const text = prompt.value.trim();
  if (!text || send.disabled) return;

  addMessage(text, "user");
  prompt.value = "";
  send.disabled = true;
  send.textContent = "THINKING...";

  const botRow = addMessage("▌", "bot");
  const bubble = botRow.querySelector(".bubble");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        prompt: text,
        temperature: Number(temperature.value),
        max_new_tokens: Number(tokens.value)
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Generation failed.");

    bubble.textContent = data.text;
  } catch (err) {
    bubble.textContent = "ERROR: " + err.message;
  } finally {
    send.disabled = false;
    send.innerHTML = 'GENERATE <span>➜</span>';
    output.scrollTop = output.scrollHeight;
  }
}

send.addEventListener("click", generate);
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    generate();
  }
});

checkStatus();
