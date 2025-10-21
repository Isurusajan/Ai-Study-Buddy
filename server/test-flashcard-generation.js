require('dotenv').config();
const { generateFlashcards } = require('./services/geminiService');

async function testFlashcardGeneration() {
  console.log('🧪 Testing Flashcard Generation...\n');

  const sampleText = `
    Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide
    to create oxygen and energy in the form of sugar. This process is essential for life on Earth
    as it provides oxygen for animals to breathe and forms the base of the food chain.

    The process occurs in two main stages: the light-dependent reactions and the Calvin cycle.
    Light-dependent reactions occur in the thylakoid membrane and produce ATP and NADPH.
    The Calvin cycle takes place in the stroma and uses ATP and NADPH to convert CO2 into glucose.
  `;

  try {
    console.log('📚 Sample text length:', sampleText.length, 'characters\n');
    console.log('🤖 Generating 5 flashcards...\n');

    const flashcards = await generateFlashcards(sampleText, 5);

    console.log('\n✅ SUCCESS! Generated flashcards:\n');
    console.log('═'.repeat(60));

    flashcards.forEach((card, index) => {
      console.log(`\nFlashcard #${index + 1}:`);
      console.log(`  Difficulty: ${card.difficulty}`);
      console.log(`  Question: ${card.question}`);
      console.log(`  Answer: ${card.answer}`);
      console.log('─'.repeat(60));
    });

    console.log('\n🎉 Flashcard generation is WORKING!');
    console.log('✅ Your app should now be able to generate flashcards!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testFlashcardGeneration();
