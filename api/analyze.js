export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profession } = req.body;
  if (!profession) {
    return res.status(400).json({ error: 'Profession is required' });
  }

  const promptText = `Проанализируй профессию "\${profession}". Ответ верни СТРОГО в формате JSON без разметки markdown и без каких-либо дополнительных символов вроде \`\`\`json. Структура ответа должна быть точно такой:
  {
    "p": 45,
    "r": "Среднее влияние",
    "y26": "Подробный русский текст прогноза влияния ИИ на эту профессию к 2026 году.",
    "y30": "Подробный русский текст прогноза влияния ИИ на эту профессию к 2030 году.",
    "y35": "Подробный русский текст прогноза влияния ИИ на эту профессию к 2035 году.",
    "why": ["русская задача ИИ 1", "русская задача ИИ 2", "русская задача ИИ 3", "русская задача ИИ 4"],
    "human": ["русская задача человека 1", "русская задача человека 2", "русская задача человека 3", "русская задача человека 4"],
    "skills": ["русский навык 1", "русский навык 2", "русский навык 3", "русский навык 4"]
  }`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://googleapis.com{apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Ошибка API Gemini' });
    }

    const resData = await response.json();
    let aiText = resData.candidates.content.parts.text.trim();
    
    const data = JSON.parse(aiText);
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера при обработке данных' });
  }
}
