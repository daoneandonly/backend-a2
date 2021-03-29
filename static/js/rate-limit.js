window.addEventListener('DOMContentLoaded', function() {

    let secondsLeft = 300;

    setInterval(function() {

        document.querySelector("#countdown").innerHTML = secondsLeft;

        secondsLeft--;

        if (secondsLeft <= 0) {
            location.reload();
        }
    }, 1000);
});
