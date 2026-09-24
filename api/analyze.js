export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profession } = req.body;
  if (!profession) {
    return res.status(400).json({ error: 'Profession is required' });
  }

  const promptText = "Проанализируй профессию \"" + profession + "\". Ответ верни СТРОГО в формате JSON без разметки markdown и без каких-либо дополнительных символов вроде ```json. Структура ответа должна быть точно такой:\n{\n  \"p\": 45,\n  \"r\": \"Среднее влияние\",\n  \"y26\": \"Подробный русский текст прогноза влияния ИИ на эту профессию к 2026 году.\",\n  \"y30\": \"Подробный русский текст прогноза влияния ИИ на эту профессию к 2030 году.\",\n  \"y35\": \"Подробный русский текст прогноза влияния ИИ на эту профессию к 2035 году.\",\n  \"why\": [\"русская задача ИИ 1\", \"русская задача ИИ 2\", \"русская задача ИИ 3\", \"русская задача ИИ 4\"],\n  \"human\": [\"русская задача человека 1\", \"русская задача человека 2\", \"русская задача человека 3\", \"русская задача человека 4\"],\n  \"skills\": [\"русский навык 1\", \"русский навык 2\", \"русский навык 3\", \"русский навык 4\"]\n}";

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Ключ GEMINI_API_KEY не найден в настройках Vercel' });
    }

    // ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ РАБОЧИЙ АДРЕС GOOGLE GEMINI
    const url = "https://googleapis.com" + apiKey;

    const response = await fetch(url, {
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
    let aiText = resData.candidates[0].content.parts[0].text.trim();
    
    aiText = aiText.replace(/^```json/, '').replace(/```$/, '').trim();

    const data = JSON.parse(aiText);
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера при обработке данных' });
  }
}
