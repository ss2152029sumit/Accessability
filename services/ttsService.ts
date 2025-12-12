export const speakText = (text: string) => {
  if (!window.speechSynthesis) return;

  // Cancel any currently speaking text to avoid backlog
  window.speechSynthesis.cancel();

  // Create clean text for speech (remove markdown asterisks, etc)
  const cleanText = text
    .replace(/\*/g, '') // Remove bold markers
    .replace(/🚨/g, 'Alert. ') // Replace emoji with word
    .replace(/⚠️/g, 'Warning. ')
    .replace(/✅/g, '')
    .replace(/<[^>]*>/g, ''); // Remove HTML tags if any

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Attempt to select a clear English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.name.includes('Google US English') || 
    v.name.includes('Samantha') || 
    v.lang === 'en-US'
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 1.1; // Slightly faster for efficiency
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};

export const cancelSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};