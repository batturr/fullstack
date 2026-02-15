var i = 0;

setInterval(sample,100);

function sample()
{
    i++;
    postMessage(i)
}
