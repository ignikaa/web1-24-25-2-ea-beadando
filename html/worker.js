let i = 0;

function countNumbers() {
    i = i + 1;
    postMessage(i);
    setTimeout("countNumbers()", 500);
}

countNumbers();