document.addEventListener('DOMContentLoaded', () => {
    const twoPlayersBtn = document.getElementById('two-players');
    const onePlayerBtn = document.getElementById('one-player');
    const exitBtn = document.getElementById('exit');

    twoPlayersBtn.addEventListener('click', () => {
        window.location.href = 'game.html?mode=two';
    });

    onePlayerBtn.addEventListener('click', () => {
        window.location.href = 'game.html?mode=ai';
    });

    exitBtn.addEventListener('click', () => {
        window.close();
    });

    // Efecto hover para los botones
    const options = document.querySelectorAll('.menu-option');
    options.forEach(option => {
        option.addEventListener('mouseover', () => {
            option.style.color = '#9e9e9e';
        });

        option.addEventListener('mouseout', () => {
            option.style.color = 'white';
        });
    });
});