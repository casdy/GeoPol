async function listAudioModels() {
  const hfKey = process.env.HF_KEY;
  const res = await fetch("https://router.huggingface.co/v1/models", {
    headers: { "Authorization": `Bearer ${hfKey}` }
  });
  const data = await res.json();
  const allModels = data.data || [];
  
  const audioModels = allModels.filter(m => {
    const outputs = m.architecture?.output_modalities || [];
    const inputs = m.architecture?.input_modalities || [];
    return outputs.some(mod => mod.toLowerCase().includes("audio")) || 
           inputs.some(mod => mod.toLowerCase().includes("audio")) ||
           m.id.toLowerCase().includes("tts") ||
           m.id.toLowerCase().includes("speech") ||
           m.id.toLowerCase().includes("audio");
  });

  console.log(`Found ${audioModels.length} potential audio models:`);
  console.log(JSON.stringify(audioModels.map(m => ({ id: m.id, outputs: m.architecture?.output_modalities })), null, 2));
}
listAudioModels();
