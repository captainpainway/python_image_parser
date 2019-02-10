const palette = document.getElementById('palette');
const preview = document.getElementById('preview');
const drop_input = document.getElementById('drop_input');
const imgupload = document.getElementById('imgupload');
const number = document.getElementById('number');
const colorlist = document.getElementById('hexcolors');
const copycolors = document.getElementById('copycolors');
const viewtype = document.getElementsByName('viewtype');
const reset = document.getElementById('reset');
const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
}

let currentFile = null;
let clicked = false;

window.onload = () => imgupload.value = null;

if (viewtype[0].checked) {
    palette.className = "regular";
} else {
    palette.className = "compact";
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
    drop_input.addEventListener(e, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(e => {
    drop_input.addEventListener(e, () => {
        drop_input.classList.add('highlight');
    }, false);
});

['dragleave', 'drop'].forEach(e => {
    drop_input.addEventListener(e, () => {
        drop_input.classList.remove('highlight');
    }, false);
})

drop_input.addEventListener('drop', e => {
    imgData(e.dataTransfer.files);
}, false);

drop_input.addEventListener('click', e => {
    imgupload.click();
}, false);

number.onchange = () => {
    imgData(currentFile);
};

function changeView(view) {
    palette.className = view;
    if (view == 'regular') {
        let cards = document.getElementsByClassName('card');
        // for (let i = 0; i < cards.length; i++) {
        //     cards[i].classList.remove('flip-vertical-right');
        // }
        if (clicked) {
            reset.classList.add('show');
            reset.classList.remove('hide');
        }
    } else {
        reset.classList.remove('show');
        reset.classList.add('hide');
    }
}

copycolors.addEventListener('click', e => {
    hexcolors.select();
    document.execCommand('copy');
});

reset.addEventListener('click', e => {
    let cards = document.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove('flip-vertical-right');
    }
    reset.classList.remove('show');
    reset.classList.add('hide');
    clicked = false;
});

function imgData(file) {
    if (file !== currentFile) {
        currentFile = file;
    }
    const newFile = file[0];
    if (!newFile) return;
    if (number.value > 128 || number.value < 1) return;
    if (newFile.type !== 'image/jpeg' 
    && newFile.type !== 'image/png'
    && newFile.type !== 'image/gif'
    && newFile.type !== 'image/webp') {
        palette.innerHTML = 'Unsupported file type.';
        return;
    }
    new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = function() {
            drop_input.style.backgroundImage = `url('${reader.result}')`;
            resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(newFile);
    }).then(response => {
        palette.innerHTML = '<div><div id="spinner-parent"><img src="spinner.png" id="spinner" /></div><p>Fetching swatches...</p></div>';
        fetch('/imagedata', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                number: number.valueAsNumber,
                imgfile: response
            })
        }).then(response => {
            return response.json();
        }).then(data => {
            palette.innerHTML = '';
            colorlist.innerText = `[${data.hex.join(', ')}]`;
            let cards = [];

            console.log(data)
            data.hex.map((d, idx) => {
                const card_temp = document.getElementById('card_template');
                const card = card_temp.cloneNode(true);
                card.removeAttribute('id');

                const swatch = card.getElementsByClassName('swatch')[0];
                swatch.style.backgroundColor = d;
                swatch.title = d;

                const color = card.getElementsByClassName('colorhex')[0];
                color.textContent = d;

                const colorlist = card.getElementsByClassName('colorlist')[0];
                colorlist.style.borderColor = d;

                colorlist.getElementsByClassName('hex')[0].innerText = `Hex: ${d}`;
                colorlist.getElementsByClassName('rgb')[0].innerText = `RGB: ${data.rgb[idx].join(', ')}`;
                colorlist.getElementsByClassName('hsl')[0].innerText = `HSL: ${hls(data.hls[idx]).join(', ')}`;
                colorlist.getElementsByClassName('hsv')[0].innerText = `HSV: ${hsv(data.hsv[idx]).join(', ')}`;

                card.classList.add('animate-in');
                card.addEventListener('click', () => {
                    if (palette.classList.contains('compact')) {
                        return;
                    }
                    if (card.classList.contains('flip-vertical-right')) {
                        return;
                    }
                    card.classList.add('flip-vertical-right');
                    if (!clicked) {
                        reset.classList.add('show');
                        reset.classList.remove('hide');
                        clicked = true;
                    }
                }, false);
                cards.push(card);

                const spacer = document.createElement('div');
                spacer.id = 'spacer_' + idx;
                spacer.className = 'spacer';
                palette.appendChild(spacer);
            });

            let i = 0;
            let interval = setInterval(() => {
                if (i == number.valueAsNumber - 1) {
                    clearInterval(interval);
                }
                document.getElementById('spacer_' + i).appendChild(cards[i]);
                i++
            }, 100)
        }).catch(() => {
            palette.innerHTML = 'File error. Try another image.';
        });
    });
}

function hls(hls) {
    const [h, l, s] = [...hls];
    return [(h * 100 + 0.5) | 0, ((s * 100 + 0.5) | 0) + '%', ((l * 100 + 0.5) | 0) + '%'];
}

function hsv(hsv) {
    const [h, s, v] = [...hsv];
    return [(h * 100 + 0.5) | 0, ((s * 100 + 0.5) | 0) + '%', ((v * 100 + 0.5) | 0) + '%'];
}