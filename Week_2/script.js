document.addEventListener('DOMContentLoaded', function() {
    //collect all the sentences
    const sentences = [
        document.querySelector('.first-sentence'),
        document.querySelector('.second-sentence'),
        document.querySelector('.third-sentence'),
        document.querySelector('.fourth-sentence'),
        document.querySelector('.fifth-sentence'),
        document.querySelector('.sixth-sentence')
    ];
//get key elements
    const storyText = document.querySelector('.story-text');
    const bgMusic = document.getElementById('bgMusic');
    const sixthSentence = document.querySelector('.sixth-sentence');
    let currentSentence = 0;
    let musicStarted = false;

    // add click function to whole story
    storyText.addEventListener('click', function() {
        // play music
        if (!musicStarted) {
            bgMusic.play().catch(function(error) {
                console.log('Audio play failed:', error);
            });
            musicStarted = true;
        }

        // hide current sentence
        sentences[currentSentence].style.opacity = '0';

        //  when hide sixth sentence, remove active 
        if (currentSentence === 5) {
            sixthSentence.classList.remove('active');
        }

        // show next sentence,move to the first sentence if its the last 
        currentSentence = (currentSentence + 1) % sentences.length;
        sentences[currentSentence].style.opacity = '1';

        // sixth sentence show up,add the active 
        if (currentSentence === 5) {
            sixthSentence.classList.add('active');
        }
    });
});